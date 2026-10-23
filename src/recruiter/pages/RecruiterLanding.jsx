import React from "react";

export default function RecruiterLanding({ onLogin, onRegister }) {
  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-logo">
          <span>Omics</span><strong>Hub</strong>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-link" onClick={onLogin}>
            Sign In
          </button>

          <button className="landing-register-btn" onClick={onRegister}>
            Create Recruiter Account
          </button>
        </div>
      </header>

      <main className="landing-content">
        <section className="landing-hero">
          <div className="landing-badge">
            RECRUITER WORKSPACE
          </div>

          <h1>
            Build stronger
            <br />
            scientific teams.
          </h1>

          <p>
            Manage opportunities, discover scientific talent and move
            candidates through a professional recruitment workflow.
          </p>

          <div className="landing-actions">
            <button className="landing-primary-btn" onClick={onRegister}>
              Get Started →
            </button>

            <button className="landing-secondary-btn" onClick={onLogin}>
              Sign In
            </button>
          </div>

          <div className="landing-features">
            <div>
              <span>✓</span>
              Job management
            </div>

            <div>
              <span>✓</span>
              Scientific talent search
            </div>

            <div>
              <span>✓</span>
              Recruitment analytics
            </div>
          </div>
        </section>

        <section className="landing-visual">
          <div className="landing-card">
            <div className="landing-card-header">
              <div>
                <small>RECRUITER DASHBOARD</small>
                <h3>Talent Overview</h3>
              </div>

              <div className="landing-card-dot">●</div>
            </div>

            <div className="landing-stats">
              <div>
                <strong>24</strong>
                <span>Open roles</span>
              </div>

              <div>
                <strong>186</strong>
                <span>Applicants</span>
              </div>

              <div>
                <strong>42</strong>
                <span>Shortlisted</span>
              </div>
            </div>

            <div className="landing-progress">
              <div className="progress-label">
                <span>Recruitment pipeline</span>
                <span>78%</span>
              </div>

              <div className="progress-bar">
                <div></div>
              </div>
            </div>

            <div className="landing-candidate">
              <div className="candidate-avatar">AS</div>

              <div>
                <strong>Bioinformatics Analyst</strong>
                <span>Python · R · RNA-seq · Linux</span>
              </div>

              <b>92%</b>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}