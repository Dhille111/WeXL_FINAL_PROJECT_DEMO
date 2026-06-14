import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-container">
      <!-- Ambient Decorative Lights -->
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>

      <!-- Hero Header Section -->
      <header class="landing-header">
        <div class="logo">
          <span class="logo-accent">NEC</span> Assistant
        </div>
        <nav class="nav-links">
          <a routerLink="/login" class="nav-btn btn-secondary">Sign In</a>
          <a routerLink="/register" class="nav-btn btn-primary">Get Started</a>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="hero-section">
        <div class="hero-text">
          <div class="badge">Next-Gen Voice Intelligence</div>
          <h1>Conversational AI<br><span class="gradient-text">Built for Enterprise</span></h1>
          <p>Experience ultra-low latency, bidirectional voice agents powered by Gemini Live API and Pipecat. Answer FAQs instantly and orchestrate sessions with robust backend logging.</p>
          <div class="cta-group">
            <a routerLink="/register" class="btn btn-hero-primary">Launch Assistant</a>
            <a routerLink="/login" class="btn btn-hero-secondary">Explore Dashboard</a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="glass-panel preview-card">
            <div class="preview-header">
              <div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
              <div class="preview-title">Voice Assistant Live Console</div>
            </div>
            <div class="preview-body">
              <div class="waveform-container">
                <div class="wave-bar" style="height: 40px; animation-delay: 0.1s"></div>
                <div class="wave-bar" style="height: 70px; animation-delay: 0.3s"></div>
                <div class="wave-bar" style="height: 100px; animation-delay: 0.5s"></div>
                <div class="wave-bar" style="height: 60px; animation-delay: 0.2s"></div>
                <div class="wave-bar" style="height: 30px; animation-delay: 0.4s"></div>
              </div>
              <div class="chat-placeholder">
                <div class="bubble user">"What are your office hours?"</div>
                <div class="bubble bot">"Our enterprise office hours are 9 AM to 6 PM Monday to Friday..."</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer Features -->
      <section class="features-grid">
        <div class="glass-panel feature-card">
          <span class="material-icons feat-icon">mic</span>
          <h3>Gemini Live Audio</h3>
          <p>Natural, interruption-friendly voice interactions using the Multimodal Live API.</p>
        </div>
        <div class="glass-panel feature-card">
          <span class="material-icons feat-icon">security</span>
          <h3>Role Security</h3>
          <p>Secure authentication via JWT and roles keeping conversations private.</p>
        </div>
        <div class="glass-panel feature-card">
          <span class="material-icons feat-icon">analytics</span>
          <h3>Token Analytics</h3>
          <p>Audit costs and latencies through built-in analytics dashboards.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 0 4rem;
      background: radial-gradient(circle at 50% 0%, #151a26 0%, #0a0c10 70%);
      overflow: hidden;
    }

    .glow-orb {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(150px);
      z-index: 0;
      pointer-events: none;
    }

    .orb-1 {
      top: -100px;
      right: 10%;
      background: rgba(0, 153, 255, 0.15);
    }

    .orb-2 {
      bottom: -100px;
      left: 10%;
      background: rgba(138, 43, 226, 0.12);
    }

    .landing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 80px;
      z-index: 10;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .logo-accent {
      background: linear-gradient(135deg, #0099ff 0%, #8a2be2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-btn {
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0099ff 0%, #8a2be2 100%);
      color: #fff;
    }

    .btn-secondary {
      color: #9ca3af;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-secondary:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.03);
    }

    .hero-section {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      align-items: center;
      gap: 4rem;
      flex-grow: 1;
      padding: 4rem 0;
      z-index: 10;
    }

    .hero-text h1 {
      font-size: 3.5rem;
      line-height: 1.1;
      font-weight: 800;
      margin-top: 1rem;
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #0099ff 0%, #8a2be2 50%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(0, 153, 255, 0.1);
      border: 1px solid rgba(0, 153, 255, 0.2);
      border-radius: 20px;
      color: #0099ff;
    }

    .hero-text p {
      color: #9ca3af;
      font-size: 1.15rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    .cta-group {
      display: flex;
      gap: 1.5rem;
    }

    .btn {
      padding: 0.85rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }

    .btn-hero-primary {
      background: linear-gradient(135deg, #0099ff 0%, #8a2be2 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(0, 153, 255, 0.3);
    }

    .btn-hero-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(0, 153, 255, 0.4);
    }

    .btn-hero-secondary {
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-hero-secondary:hover {
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-2px);
    }

    .preview-card {
      border-radius: 16px;
      overflow: hidden;
    }

    .preview-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .dots {
      display: flex;
      gap: 5px;
      margin-right: 1.5rem;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
    }

    .preview-title {
      font-size: 0.8rem;
      color: #9ca3af;
      font-weight: 500;
    }

    .preview-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .waveform-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 120px;
    }

    .wave-bar {
      width: 5px;
      background: linear-gradient(to top, #0099ff, #8a2be2);
      border-radius: 4px;
      animation: wave 1.2s infinite ease-in-out;
    }

    .chat-placeholder {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bubble {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
      max-width: 80%;
    }

    .bubble.user {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .bubble.bot {
      align-self: flex-end;
      background: linear-gradient(135deg, rgba(0, 153, 255, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%);
      border: 1px solid rgba(138, 43, 226, 0.2);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      padding: 3rem 0;
      z-index: 10;
    }

    .feature-card {
      padding: 2rem;
    }

    .feat-icon {
      font-size: 2rem;
      color: #0099ff;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .feature-card p {
      color: #9ca3af;
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 1024px) {
      .landing-container {
        padding: 0 2rem;
      }
      .hero-section {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
      }
      .hero-text h1 {
        font-size: 2.75rem;
      }
      .cta-group {
        justify-content: center;
      }
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {}
