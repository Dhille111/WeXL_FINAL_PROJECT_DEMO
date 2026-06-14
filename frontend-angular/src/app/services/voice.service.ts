import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export interface ChatMessage {
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private backendUrl = `http://${window.location.hostname}:8080/api`;
  private aiServiceWsUrl = `ws://${window.location.hostname}:8000/ws/transcript`;

  // Signals
  public sessionStatus = signal<'IDLE' | 'CONNECTING' | 'ACTIVE' | 'ERROR'>('IDLE');
  public currentSessionId = signal<string | null>(null);
  public messages = signal<ChatMessage[]>([]);
  public isMuted = signal<boolean>(false);

  private callFrame: DailyCall | null = null;
  private ws: WebSocket | null = null;

  constructor(private http: HttpClient) {}

  public startVoiceSession(): void {
    if (this.sessionStatus() !== 'IDLE') return;
    
    this.sessionStatus.set('CONNECTING');
    this.messages.set([]);

    // 1. Post to Spring Boot to start orchestrating
    this.http.post<any>(`${this.backendUrl}/voice/start`, {}).subscribe({
      next: async (res) => {
        const sessionId = res.sessionId;
        this.currentSessionId.set(sessionId);
        
        try {
          // If the room URL is a mock fallback (e.g. Daily key is missing or FastAPI is bypassed),
          // skip WebRTC initialization and directly establish websocket transcription
          if (res.roomUrl && res.roomUrl.includes('mock-session')) {
            console.log('Mock session detected. Activating transcript WS bypass...');
            this.isMuted.set(false);
            this.connectTranscriptWebSocket(sessionId);
            this.sessionStatus.set('ACTIVE');
            return;
          }

          // 2. Initialize WebRTC call via Daily.co call object
          this.callFrame = DailyIframe.createCallObject({
            audioSource: true, // Request microphone access
            videoSource: false // Audio-only voice agent
          });

          await this.callFrame.join({
            url: res.roomUrl,
            token: res.token
          });

          // Unmute microphone by default
          this.callFrame.setLocalAudio(true);
          this.isMuted.set(false);

          // 3. Connect WebSocket to stream transcripts
          this.connectTranscriptWebSocket(sessionId);
          
          this.sessionStatus.set('ACTIVE');
        } catch (err) {
          console.error('Failed to join WebRTC voice room:', err);
          this.sessionStatus.set('ERROR');
          this.stopVoiceSession();
        }
      },
      error: (err) => {
        console.error('Failed to initialize session on Spring Boot:', err);
        this.sessionStatus.set('ERROR');
      }
    });
  }

  public stopVoiceSession(): void {
    const sessionId = this.currentSessionId();
    if (!sessionId) {
      this.resetStates();
      return;
    }

    // 1. Call Spring Boot to finalize session & analytics
    this.http.post<any>(`${this.backendUrl}/voice/stop?sessionId=${sessionId}`, {}).subscribe({
      next: () => {
        this.resetStates();
      },
      error: () => {
        this.resetStates();
      }
    });
  }

  public toggleMute(): void {
    if (this.callFrame) {
      const newMuted = !this.isMuted();
      this.callFrame.setLocalAudio(!newMuted);
      this.isMuted.set(newMuted);
    }
  }

  private connectTranscriptWebSocket(sessionId: string): void {
    const wsUrl = `${this.aiServiceWsUrl}?session_id=${sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const role = data.type === 'user_transcript' ? 'USER' : 'ASSISTANT';
        
        // Push message to transcript array
        this.messages.update(prev => [...prev, {
          role,
          content: data.text,
          timestamp: new Date()
        }]);
      } catch (e) {
        console.error('Error reading transcription WebSocket payload:', e);
      }
    };

    this.ws.onerror = (err) => {
      console.error('Transcription WebSocket encountered an error:', err);
    };

    this.ws.onclose = () => {
      console.log('Transcription WebSocket channel closed.');
    };
  }

  private resetStates(): void {
    // Leave WebRTC call
    if (this.callFrame) {
      this.callFrame.leave();
      this.callFrame.destroy();
      this.callFrame = null;
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentSessionId.set(null);
    this.sessionStatus.set('IDLE');
  }
}
