import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  aliases: string[];
}

export interface ChatSession {
  sessionId: string;
  roomUrl: string;
  token: string;
  status: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>NEC Enterprise Management Dashboard</h1>
        <p class="subtitle">Analyze analytics and manage knowledge base FAQs</p>
      </div>

      <!-- Key Performance Indicators -->
      <section class="kpi-grid">
        <div class="glass-panel kpi-card">
          <div class="kpi-info">
            <span class="kpi-title">Total Voice Sessions</span>
            <span class="kpi-val">{{ stats.totalSessions || 0 }}</span>
          </div>
          <span class="material-icons kpi-icon">record_voice_over</span>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-info">
            <span class="kpi-title">Average Call Duration</span>
            <span class="kpi-val">{{ (stats.averageSessionDuration || 0) | number:'1.0-1' }}s</span>
          </div>
          <span class="material-icons kpi-icon">schedule</span>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-info">
            <span class="kpi-title">Knowledge FAQs Seeding</span>
            <span class="kpi-val">{{ stats.totalFAQs || 0 }}</span>
          </div>
          <span class="material-icons kpi-icon">library_books</span>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-info">
            <span class="kpi-title">Token Output Volume</span>
            <span class="kpi-val">{{ stats.totalOutputTokens || 0 | number }}</span>
          </div>
          <span class="material-icons kpi-icon">generating_tokens</span>
        </div>
      </section>

      <!-- Main Workspace -->
      <div class="workspace-grid">
        <!-- FAQ Management Module -->
        <div class="glass-panel module-card">
          <div class="module-header">
            <h3>Knowledge Base FAQs</h3>
            <button class="btn-primary" (click)="openAddFaqForm()">
              <span class="material-icons">add</span>
              <span>New FAQ</span>
            </button>
          </div>

          <!-- Add/Edit Form Overlay -->
          <div *ngIf="showFaqForm" class="faq-form-card glass-panel">
            <h4>{{ editingFaqId ? 'Edit FAQ Entry' : 'Create FAQ Entry' }}</h4>
            <div class="form-row">
              <label>Question</label>
              <input type="text" [(ngModel)]="faqForm.question" placeholder="e.g. What is your phone number?">
            </div>
            <div class="form-row">
              <label>Answer (Source of Truth)</label>
              <textarea [(ngModel)]="faqForm.answer" rows="3" placeholder="e.g. Our telephone support is available at..."></textarea>
            </div>
            <div class="form-row">
              <label>Intent Aliases (comma separated)</label>
              <input type="text" [(ngModel)]="faqForm.aliasesString" placeholder="e.g. contact details, phone, mobile">
            </div>
            <div class="form-actions">
              <button class="btn-cancel" (click)="showFaqForm = false">Cancel</button>
              <button class="btn-submit" (click)="saveFaq()">Save FAQ</button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="faq-search-bar">
            <span class="material-icons search-icon">search</span>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search FAQs by question, answer, or keywords...">
          </div>

          <!-- FAQ Cards Grid -->
          <div class="faq-grid-scroll">
            <div class="faq-tile-card glass-panel" *ngFor="let faq of getFilteredFaqs()">
              <div class="faq-tile-header">
                <span class="material-icons faq-tile-icon">help_outline</span>
                <div class="faq-tile-actions">
                  <button class="btn-icon" (click)="editFaq(faq)">
                    <span class="material-icons text-blue">edit</span>
                  </button>
                  <button class="btn-icon" (click)="deleteFaq(faq.id!)">
                    <span class="material-icons text-red">delete</span>
                  </button>
                </div>
              </div>
              <div class="faq-tile-body">
                <h4 class="faq-tile-question">{{ faq.question }}</h4>
                <p class="faq-tile-answer">{{ faq.answer }}</p>
              </div>
              <div class="faq-tile-footer" *ngIf="faq.aliases && faq.aliases.length > 0">
                <div class="alias-tags">
                  <span class="alias-tag" *ngFor="let tag of faq.aliases">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat History List Module -->
        <div class="glass-panel module-card">
          <div class="module-header">
            <h3>Past Conversational Transcripts</h3>
            <span class="material-icons text-muted">history</span>
          </div>

          <div class="sessions-feed">
            <div class="session-row" 
                 *ngFor="let session of sessions" 
                 [class.selected-session]="selectedSessionId === session.sessionId"
                 (click)="loadSessionMessages(session.sessionId)">
              <div class="session-info">
                <span class="session-id">Session UUID: {{ session.sessionId | slice:0:8 }}...</span>
                <span class="session-tag" [ngClass]="session.status.toLowerCase()">{{ session.status }}</span>
              </div>
              <span class="material-icons">chevron_right</span>
            </div>
          </div>

          <!-- Dialog overlay of selected transcript -->
          <div class="message-dialog" *ngIf="selectedSessionId">
            <div class="dialog-header">
              <h4>Transcripts Log: {{ selectedSessionId | slice:0:8 }}</h4>
              <button class="btn-close" (click)="selectedSessionId = null">
                <span class="material-icons">close</span>
              </button>
            </div>
            <div class="dialog-body">
              <div *ngFor="let msg of sessionMessages" 
                   class="log-bubble" 
                   [ngClass]="msg.role === 'USER' ? 'user' : 'agent'">
                <strong>{{ msg.role === 'USER' ? 'User' : 'Agent' }}:</strong>
                <p>{{ msg.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 3rem;
      background: radial-gradient(circle at bottom left, #121824 0%, #0a0c10 80%);
      min-height: 100vh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .header h1 {
      margin: 0;
      font-size: 1.85rem;
      font-weight: 700;
    }

    .subtitle {
      margin-top: 0.5rem;
      margin-bottom: 0;
      color: #9ca3af;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .kpi-card {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .kpi-val {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .kpi-icon {
      font-size: 2.5rem;
      color: #0099ff;
      opacity: 0.8;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 2.5rem;
      flex-grow: 1;
    }

    .module-card {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .module-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0099ff 0%, #8a2be2 100%);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .faq-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .faq-table th {
      padding: 1rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.05);
      color: #9ca3af;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .faq-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.9rem;
    }

    .bold-cell {
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }

    .btn-icon:hover {
      background: rgba(255,255,255,0.03);
    }

    .text-blue { color: #0099ff; }
    .text-red { color: #ef4444; }

    .faq-form-card {
      padding: 1.5rem;
      background: #111520;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-row label {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .form-row input, .form-row textarea {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      padding: 0.6rem;
      color: white;
      font-family: inherit;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .sessions-feed {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
      max-height: 400px;
    }

    .session-row {
      padding: 1rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .session-row:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.1);
    }

    .session-row.selected-session {
      border-color: #0099ff;
      background: rgba(0, 153, 255, 0.05);
    }

    .session-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .session-id {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .session-tag {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .session-tag.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .session-tag.active { background: rgba(0, 153, 255, 0.1); color: #0099ff; }
    .session-tag.pending { background: rgba(255, 170, 0, 0.1); color: #ffaa00; }

    .message-dialog {
      margin-top: 1.5rem;
      background: #0d111a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 0.5rem;
    }

    .dialog-header h4 { margin: 0; }

    .btn-close {
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
    }

    .dialog-body {
      max-height: 250px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .log-bubble {
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .log-bubble.user { background: rgba(255,255,255,0.03); align-self: flex-end; width: 85%; }
    .log-bubble.agent { background: rgba(0, 153, 255, 0.05); align-self: flex-start; width: 85%; }

    .log-bubble p { margin: 0.25rem 0 0 0; }

    /* FAQ Section Redesign Styles */
    .faq-search-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.6rem 1rem;
      margin-bottom: 0.5rem;
    }

    .faq-search-bar .search-icon {
      color: #9ca3af;
      font-size: 1.25rem;
    }

    .faq-search-bar input {
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-family: inherit;
      font-size: 0.9rem;
      width: 100%;
    }

    .faq-search-bar input::placeholder {
      color: #4b5563;
    }

    .faq-grid-scroll {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      max-height: 480px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .faq-tile-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.015);
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .faq-tile-card:hover {
      background: rgba(255, 255, 255, 0.03);
      transform: translateY(-2px);
      border-color: rgba(0, 153, 255, 0.25);
      box-shadow: 0 8px 25px rgba(0, 153, 255, 0.05);
    }

    .faq-tile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .faq-tile-icon {
      color: #0099ff;
      font-size: 1.5rem;
    }

    .faq-tile-actions {
      display: flex;
      gap: 0.25rem;
    }

    .faq-tile-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-grow: 1;
    }

    .faq-tile-question {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #f3f4f6;
      line-height: 1.4;
    }

    .faq-tile-answer {
      margin: 0;
      font-size: 0.85rem;
      color: #9ca3af;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .faq-tile-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      padding-top: 0.75rem;
    }

    .alias-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .alias-tag {
      background: rgba(138, 43, 226, 0.1);
      color: #a78bfa;
      border: 1px solid rgba(138, 43, 226, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  public stats: any = {};
  public faqs: FAQ[] = [];
  public sessions: ChatSession[] = [];
  public sessionMessages: ChatMessage[] = [];
  public selectedSessionId: string | null = null;

  // FAQ Redesign Search state
  public searchQuery: string = '';

  // FAQ CRUD state
  public showFaqForm = false;
  public editingFaqId: number | null = null;
  public faqForm = {
    question: '',
    answer: '',
    aliasesString: ''
  };

  public getFilteredFaqs(): FAQ[] {
    if (!this.searchQuery) return this.faqs;
    const q = this.searchQuery.toLowerCase();
    return this.faqs.filter(f => 
      f.question.toLowerCase().includes(q) || 
      f.answer.toLowerCase().includes(q) ||
      (f.aliases && f.aliases.some(a => a.toLowerCase().includes(q)))
    );
  }

  private backendUrl = `http://${window.location.hostname}:8080/api`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadFAQs();
    this.loadChatHistory();
  }

  public loadStats() {
    this.http.get<any>(`${this.backendUrl}/analytics`).subscribe({
      next: (res) => this.stats = res,
      error: (e) => console.error('Error loading analytics:', e)
    });
  }

  public loadFAQs() {
    this.http.get<FAQ[]>(`${this.backendUrl}/faqs`).subscribe({
      next: (res) => this.faqs = res,
      error: (e) => console.error('Error loading FAQs:', e)
    });
  }

  public loadChatHistory() {
    this.http.get<ChatSession[]>(`${this.backendUrl}/chat/history`).subscribe({
      next: (res) => this.sessions = res,
      error: (e) => console.error('Error loading chat history:', e)
    });
  }

  public loadSessionMessages(sessionId: string) {
    this.selectedSessionId = sessionId;
    this.http.get<ChatMessage[]>(`${this.backendUrl}/chat/messages?sessionId=${sessionId}`).subscribe({
      next: (res) => this.sessionMessages = res,
      error: (e) => console.error('Error loading messages:', e)
    });
  }

  public openAddFaqForm() {
    this.editingFaqId = null;
    this.faqForm = { question: '', answer: '', aliasesString: '' };
    this.showFaqForm = true;
  }

  public editFaq(faq: FAQ) {
    this.editingFaqId = faq.id || null;
    this.faqForm = {
      question: faq.question,
      answer: faq.answer,
      aliasesString: faq.aliases ? faq.aliases.join(', ') : ''
    };
    this.showFaqForm = true;
  }

  public saveFaq() {
    if (!this.faqForm.question || !this.faqForm.answer) return;
    
    const aliases = this.faqForm.aliasesString
      ? this.faqForm.aliasesString.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const body: FAQ = {
      question: this.faqForm.question,
      answer: this.faqForm.answer,
      aliases: aliases
    };

    if (this.editingFaqId) {
      this.http.put<FAQ>(`${this.backendUrl}/faqs/${this.editingFaqId}`, body).subscribe({
        next: () => {
          this.showFaqForm = false;
          this.loadFAQs();
          this.loadStats();
        }
      });
    } else {
      this.http.post<FAQ>(`${this.backendUrl}/faqs`, body).subscribe({
        next: () => {
          this.showFaqForm = false;
          this.loadFAQs();
          this.loadStats();
        }
      });
    }
  }

  public deleteFaq(id: number) {
    this.http.delete(`${this.backendUrl}/faqs/${id}`).subscribe({
      next: () => {
        this.loadFAQs();
        this.loadStats();
      }
    });
  }
}
