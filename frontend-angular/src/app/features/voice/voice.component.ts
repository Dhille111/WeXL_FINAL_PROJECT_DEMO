import { Component, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VoiceService } from '../../services/voice.service';

@Component({
  selector: 'app-voice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="voice-console-container">
      <!-- Header -->
      <div class="console-header">
        <div class="brand-section" routerLink="/dashboard">
          <img class="college-logo" src="https://www.nrtec.in/wp-content/uploads/2017/03/NEClogo.png" alt="NEC College Logo" />
          <span class="brand-title">Enterprise AI Portal</span>
        </div>
        <div class="header-actions">
          <a class="nav-link" routerLink="/dashboard">
            <span class="material-icons nav-icon">dashboard</span>
            <span>Dashboard</span>
          </a>
          <div class="status-badge" [ngClass]="voiceService.sessionStatus().toLowerCase()">
            <span class="status-dot-pulse"></span>
            <span>{{ voiceService.sessionStatus() }}</span>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="console-grid">
        
        <!-- Column 1: System Info & Metrics -->
        <div class="sidebar-card glass-panel">
          <div class="sidebar-header">
            <h3>System Status</h3>
            <span class="material-icons header-icon">info_outline</span>
          </div>
          
          <div class="metrics-list">
            <div class="metric-row">
              <span class="metric-label">Vocal Gateway</span>
              <span class="metric-value text-blue">Online</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">AI Engine</span>
              <span class="metric-value text-violet">Gemini Live</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Seeded FAQs</span>
              <span class="metric-value">35 Records</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Latency Status</span>
              <span class="metric-value text-green">~120ms</span>
            </div>
          </div>
          
          <div class="system-logs-container">
            <h4>Live Engine Logs</h4>
            <div class="log-stream">
              <div class="log-line success" *ngIf="voiceService.sessionStatus() === 'ACTIVE'">
                <span class="log-time">1s</span>
                <span class="log-msg">Streaming audio...</span>
              </div>
              <div class="log-line warning" *ngIf="voiceService.sessionStatus() === 'CONNECTING'">
                <span class="log-time">Now</span>
                <span class="log-msg">Negotiating audio...</span>
              </div>
              <div class="log-line info" *ngIf="voiceService.isMuted() && voiceService.sessionStatus() === 'ACTIVE'">
                <span class="log-time">Sys</span>
                <span class="log-msg">Microphone muted.</span>
              </div>
              <div class="log-line">
                <span class="log-time">0s</span>
                <span class="log-msg">H2 Database connection verified.</span>
              </div>
              <div class="log-line">
                <span class="log-time">Init</span>
                <span class="log-msg">Seed completed (35 FAQs).</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Column 2: The Core Vocal Interface -->
        <div class="main-visualizer-card glass-panel">
          <div class="interactive-area">
            <div class="glow-sphere"></div>
            
            <!-- Dynamic State visualizer -->
            <div class="visualizer-stage">
              <!-- Connecting State Spinner -->
              <div class="connecting-loader" *ngIf="voiceService.sessionStatus() === 'CONNECTING'">
                <div class="spinner-ring ring-1"></div>
                <div class="spinner-ring ring-2"></div>
                <div class="spinner-ring ring-3"></div>
              </div>

              <!-- Active State Vocal Waves -->
              <div class="holographic-wave-container" *ngIf="voiceService.sessionStatus() === 'ACTIVE' && !voiceService.isMuted()">
                <div class="fluid-wave wave-1"></div>
                <div class="fluid-wave wave-2"></div>
                <div class="fluid-wave wave-3"></div>
                <div class="voice-orb active-pulse">
                  <span class="material-icons voice-icon text-blue">keyboard_voice</span>
                </div>
              </div>

              <!-- Idle State Standby Orb -->
              <div class="voice-orb standby" *ngIf="voiceService.sessionStatus() === 'IDLE'">
                <span class="material-icons voice-icon">sensors</span>
              </div>

              <!-- Muted State Warning Orb -->
              <div class="voice-orb muted-orb" *ngIf="voiceService.isMuted() && voiceService.sessionStatus() === 'ACTIVE'">
                <span class="material-icons voice-icon text-red">mic_off</span>
              </div>

              <!-- Error State warning Orb -->
              <div class="voice-orb error-orb" *ngIf="voiceService.sessionStatus() === 'ERROR'">
                <span class="material-icons voice-icon text-red">error</span>
              </div>
            </div>

            <div class="vocal-status-label">
              <span class="pulse-text" *ngIf="voiceService.sessionStatus() === 'ACTIVE' && !voiceService.isMuted()">AI Listening & Responding...</span>
              <span class="static-text text-red" *ngIf="voiceService.sessionStatus() === 'ACTIVE' && voiceService.isMuted()">Microphone Muted</span>
              <span class="static-text" *ngIf="voiceService.sessionStatus() === 'IDLE'">Agent Standby. Click Start Session to begin.</span>
              <span class="spinner-text" *ngIf="voiceService.sessionStatus() === 'CONNECTING'">Establishing secure link...</span>
              <span class="static-text text-red" *ngIf="voiceService.sessionStatus() === 'ERROR'">Connection failed. Please restart.</span>
            </div>
          </div>

          <div class="action-dock">
            <button class="btn-console-mute" 
                    [disabled]="voiceService.sessionStatus() !== 'ACTIVE'"
                    [class.muted-state]="voiceService.isMuted()" 
                    (click)="voiceService.toggleMute()">
              <span class="material-icons button-icon">
                {{ voiceService.isMuted() ? 'mic_off' : 'mic' }}
              </span>
              <span>{{ voiceService.isMuted() ? 'Unmute Mic' : 'Mute Mic' }}</span>
            </button>

            <button class="btn-console-session"
                    [class.btn-active]="voiceService.sessionStatus() === 'ACTIVE'"
                    [class.btn-connecting]="voiceService.sessionStatus() === 'CONNECTING'"
                    (click)="toggleSession()">
              <span class="material-icons button-icon">
                {{ voiceService.sessionStatus() === 'ACTIVE' ? 'power_settings_new' : 'settings_voice' }}
              </span>
              <span>
                {{ voiceService.sessionStatus() === 'ACTIVE' ? 'Disconnect' : 
                   voiceService.sessionStatus() === 'CONNECTING' ? 'Connecting...' : 'Start Session' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Column 3: Live Dialogues -->
        <div class="transcript-panel-card glass-panel">
          <div class="panel-header">
            <h3>Live Conversation Feed</h3>
            <span class="material-icons text-muted header-icon">receipt_long</span>
          </div>

          <div class="transcript-feed-scroll" #feedContainer>
            <div class="no-history-state" *ngIf="voiceService.messages().length === 0">
              <span class="material-icons empty-icon">chat_bubble_outline</span>
              <p>Conversation transcripts will stream here in real-time as you speak with the agent.</p>
            </div>

            <div class="dialogue-block" 
                 *ngFor="let msg of voiceService.messages()" 
                 [ngClass]="msg.role === 'USER' ? 'user' : 'agent'">
              <div class="dialogue-meta">
                <span class="role-tag">{{ msg.role === 'USER' ? 'You' : 'AI Assistant' }}</span>
                <span class="time-stamp">{{ msg.timestamp | date:'HH:mm:ss' }}</span>
              </div>
              <div class="dialogue-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .voice-console-container {
      padding: 2rem;
      height: 100vh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      background: transparent;
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 1rem;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
    }

    .college-logo {
      height: 42px;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.25)) brightness(1.1);
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #e5e7eb;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: var(--color-primary);
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.idle { color: #9ca3af; }
    .status-badge.connecting { color: #f59e0b; }
    .status-badge.active { color: #10b981; }
    .status-badge.error { color: #ef4444; }

    .status-dot-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }

    .status-badge.active .status-dot-pulse {
      animation: pulseGlow 1.5s infinite ease-in-out;
    }

    .console-grid {
      display: grid;
      grid-template-columns: 280px 1fr 1.2fr;
      gap: 2rem;
      flex-grow: 1;
      min-height: 0;
    }

    /* Column 1: Sidebar styling */
    .sidebar-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.75rem;
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #9ca3af;
    }

    .header-icon {
      font-size: 1.2rem;
      color: #6b7280;
    }

    .metrics-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.85rem;
    }

    .metric-label {
      color: #9ca3af;
      font-weight: 500;
    }

    .metric-value {
      font-weight: 600;
      color: #f3f4f6;
    }

    .text-blue { color: var(--color-primary); }
    .text-violet { color: #a78bfa; }
    .text-green { color: #10b981; }
    .text-red { color: #ef4444; }

    .system-logs-container {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 0;
    }

    .system-logs-container h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .log-stream {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      padding: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.03);
      overflow-y: auto;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-family: monospace;
      font-size: 0.75rem;
    }

    .log-line {
      color: #6b7280;
      line-height: 1.4;
      display: flex;
      gap: 0.5rem;
    }

    .log-time {
      color: #4b5563;
      flex-shrink: 0;
    }

    .log-msg {
      word-break: break-all;
    }

    .log-line.success .log-msg { color: #10b981; }
    .log-line.warning .log-msg { color: #f59e0b; }
    .log-line.info .log-msg { color: var(--color-primary); }

    /* Column 2: Visualizer Stage */
    .main-visualizer-card {
      display: flex;
      flex-direction: column;
      padding: 2rem;
      position: relative;
    }

    .interactive-area {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      min-height: 0;
    }

    .glow-sphere {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 153, 255, 0.15) 0%, rgba(138, 43, 226, 0.05) 70%, transparent 100%);
      filter: blur(50px);
      z-index: 0;
      pointer-events: none;
    }

    .visualizer-stage {
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 10;
    }

    .voice-orb {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1b2130 0%, #0d1017 100%);
      border: 2px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      z-index: 20;
      transition: all 0.3s;
    }

    .voice-orb.standby {
      border-color: rgba(0, 153, 255, 0.3);
      box-shadow: 0 0 30px rgba(0, 153, 255, 0.2);
    }

    .voice-orb.muted-orb {
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
    }

    .voice-orb.error-orb {
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
    }

    .voice-orb.active-pulse {
      background: linear-gradient(135deg, #0f1c2c 0%, #09101a 100%);
      border-color: rgba(167, 139, 250, 0.5);
      box-shadow: 0 0 40px rgba(167, 139, 250, 0.3);
    }

    .voice-icon {
      font-size: 3rem;
      color: #9ca3af;
    }

    .voice-orb.standby .voice-icon { color: var(--color-primary); }

    /* Fluid Glowing Waves */
    .holographic-wave-container {
      position: absolute;
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fluid-wave {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 1px solid rgba(0, 153, 255, 0.3);
      pointer-events: none;
      animation: waveRipple 3s infinite linear;
      z-index: 10;
    }

    .wave-2 {
      animation-delay: 1s;
      border-color: rgba(138, 43, 226, 0.25);
    }

    .wave-3 {
      animation-delay: 2s;
      border-color: rgba(0, 153, 255, 0.15);
    }

    /* Connecting Rings Spinner */
    .connecting-loader {
      position: absolute;
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-ring {
      position: absolute;
      width: 130px;
      height: 130px;
      border: 2px solid transparent;
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spinRing 2s infinite linear;
    }

    .ring-2 {
      width: 145px;
      height: 145px;
      border-top-color: #8a2be2;
      animation-duration: 2.5s;
      animation-direction: reverse;
    }

    .ring-3 {
      width: 160px;
      height: 160px;
      border-top-color: #10b981;
      animation-duration: 3s;
    }

    .vocal-status-label {
      margin-top: 1.5rem;
      z-index: 10;
    }

    .vocal-status-label span {
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: #9ca3af;
    }

    .vocal-status-label .pulse-text {
      color: var(--color-primary);
      text-shadow: 0 0 10px rgba(167, 139, 250, 0.4);
      animation: textPulse 2s infinite ease-in-out;
    }

    /* Action dock panel */
    .action-dock {
      display: flex;
      gap: 1.25rem;
      width: 100%;
      max-width: 360px;
      margin: 1.5rem auto 0 auto;
      z-index: 10;
    }

    .btn-console-mute, .btn-console-session {
      flex-grow: 1;
      padding: 0.85rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
      color: #f3f4f6;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-console-mute:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-console-mute:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .btn-console-mute.muted-state {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
    }

    .btn-console-session {
      background: var(--primary-gradient);
      border: none;
      box-shadow: 0 4px 15px rgba(157, 34, 124, 0.25);
    }

    .btn-console-session:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(157, 34, 124, 0.4);
    }

    .btn-console-session.btn-connecting {
      opacity: 0.75;
      cursor: wait;
    }

    .btn-console-session.btn-active {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
    }

    .btn-console-session.btn-active:hover {
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
    }

    .button-icon {
      font-size: 1.2rem;
    }

    /* Column 3: Live Dialogue panel */
    .transcript-panel-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #e5e7eb;
    }

    .transcript-feed-scroll {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-right: 0.5rem;
    }

    .no-history-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #6b7280;
      gap: 0.75rem;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 2.25rem;
      color: #4b5563;
    }

    .no-history-state p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .dialogue-block {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-width: 85%;
      animation: messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .dialogue-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .role-tag {
      font-weight: 600;
      color: #9ca3af;
    }

    .time-stamp {
      color: #4b5563;
    }

    .dialogue-content {
      padding: 0.8rem 1.1rem;
      border-radius: 12px;
      font-size: 0.92rem;
      line-height: 1.5;
      word-break: break-word;
    }

    .user {
      align-self: flex-end;
      align-items: flex-end;
    }

    .user .dialogue-content {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #f3f4f6;
      border-bottom-right-radius: 2px;
    }

    .user .role-tag {
      color: var(--color-primary);
    }

    .agent {
      align-self: flex-start;
      align-items: flex-start;
    }

    .agent .dialogue-content {
      background: linear-gradient(135deg, rgba(157, 34, 124, 0.08) 0%, rgba(138, 43, 226, 0.08) 100%);
      border: 1px solid rgba(138, 43, 226, 0.18);
      color: #f3f4f6;
      border-bottom-left-radius: 2px;
    }

    .agent .role-tag {
      color: #a78bfa;
    }

    /* Keyframes */
    @keyframes spinRing {
      to { transform: rotate(360deg); }
    }

    @keyframes waveRipple {
      0% {
        transform: scale(0.9);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.6);
        opacity: 0;
      }
    }

    @keyframes textPulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class VoiceComponent {
  @ViewChild('feedContainer') private feedContainer!: ElementRef;

  constructor(public voiceService: VoiceService) {
    // Autoscroll logic when messages update
    effect(() => {
      if (this.voiceService.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  public toggleSession() {
    if (this.voiceService.sessionStatus() === 'ACTIVE') {
      this.voiceService.stopVoiceSession();
    } else if (this.voiceService.sessionStatus() === 'IDLE') {
      this.voiceService.startVoiceSession();
    }
  }

  private scrollToBottom(): void {
    try {
      this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
