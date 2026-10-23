
import React, { useMemo } from "react";
import Layout from "../components/Layout";
import { demoJobs as fallbackDemoJobs } from "../utilis/storage";

const DEMO_COMPANY = "NovaGen Bioinformatics Pvt. Ltd.";

function formatDate(value) {
  if (!value) return "Not specified";

  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);

  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value, description, symbol }) {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <span className="dashboard-stat-label">{label}</span>
        <span className="dashboard-stat-symbol">{symbol}</span>
      </div>
      <strong className="dashboard-stat-value">{value}</strong>
      <span className="dashboard-stat-description">{description}</span>
    </div>
  );
}

export default function Dashboard({
  recruiter,
  jobs = [],
  applications = [],
  onNavigate,
  onLogout,
}) {
  const companyName = DEMO_COMPANY;

  const companyJobs = useMemo(() => {
    const suppliedJobs = Array.isArray(jobs) ? jobs : [];
    const demoIds = new Set(
      fallbackDemoJobs.map((job) => String(job.id))
    );

    // Keep existing demo jobs and all NovaGen company postings.
    const matchingJobs = suppliedJobs
      .filter((job) => {
        const organization = String(job.organization || "")
          .trim()
          .toLowerCase();

        return (
          organization === companyName.toLowerCase() ||
          demoIds.has(String(job.id))
        );
      })
      .map((job) =>
        demoIds.has(String(job.id))
          ? { ...job, organization: companyName }
          : job
      );

    const existingIds = new Set(
      matchingJobs.map((job) => String(job.id))
    );

    // Add any missing demonstration jobs so cloned repositories
    // have useful sample content on their first run.
    const missingDemoJobs = fallbackDemoJobs
      .filter((job) => !existingIds.has(String(job.id)))
      .map((job) => ({
        ...job,
        organization: companyName,
      }));

    return [...matchingJobs, ...missingDemoJobs];
  }, [jobs]);

  const activeJobs = companyJobs.filter(
    (job) => String(job.status || "Active").toLowerCase() === "active"
  );

  const closedJobs = companyJobs.filter(
    (job) => String(job.status || "").toLowerCase() === "closed"
  );

  const totalApplications = companyJobs.reduce(
    (total, job) => total + (Number(job.applications) || 0),
    0
  );

  const totalViews = companyJobs.reduce(
    (total, job) => total + (Number(job.views) || 0),
    0
  );

  const recentJobs = [...companyJobs].sort((a, b) => {
    const dateA = new Date(a.postedDate || 0).getTime() || 0;
    const dateB = new Date(b.postedDate || 0).getTime() || 0;
    return dateB - dateA;
  }).slice(0, 5);

  function navigate(page) {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  }

  return (
    <Layout
      active="dashboard"
      recruiter={{
        ...recruiter,
        companyName,
        organization: companyName,
      }}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="dashboard-home">
        <header className="dashboard-home-header">
          <div>
            <span className="dashboard-eyebrow">
              RECRUITER WORKSPACE
            </span>
            <h1>Dashboard</h1>
            <p>
              Welcome back. Here is an overview of your recruitment
              activity at <strong>{companyName}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => navigate("post-job")}
          >
            <span aria-hidden="true">＋</span> Post a Job
          </button>
        </header>

        <section className="dashboard-company-banner">
          <div className="dashboard-company-avatar">N</div>
          <div className="dashboard-company-copy">
            <span>YOUR ORGANIZATION</span>
            <h2>{companyName}</h2>
            <p>Scientific recruitment · Bioinformatics · Genomics</p>
          </div>
          <span className="dashboard-demo-badge">
            Demo workspace
          </span>
        </section>

        <section className="dashboard-stats-grid">
          <StatCard
            label="Total job postings"
            value={companyJobs.length}
            description="Across your organization"
            symbol="▤"
          />
          <StatCard
            label="Active jobs"
            value={activeJobs.length}
            description="Currently open postings"
            symbol="✓"
          />
          <StatCard
            label="Applications"
            value={totalApplications}
            description="Across demonstration jobs"
            symbol="♙"
          />
          <StatCard
            label="Job views"
            value={totalViews.toLocaleString()}
            description="Total listing views"
            symbol="◉"
          />
        </section>

        <section className="dashboard-quick-grid">
          <button
            type="button"
            className="dashboard-quick-card"
            onClick={() => navigate("my-jobs")}
          >
            <span className="dashboard-quick-icon">▤</span>
            <span>
              <strong>Manage jobs</strong>
              <small>View, edit or close your job postings</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>

          <button
            type="button"
            className="dashboard-quick-card"
            onClick={() => navigate("applications")}
          >
            <span className="dashboard-quick-icon">♙</span>
            <span>
              <strong>Applications</strong>
              <small>Review candidate application records</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>

          <button
            type="button"
            className="dashboard-quick-card"
            onClick={() => navigate("profile")}
          >
            <span className="dashboard-quick-icon">⌂</span>
            <span>
              <strong>Company profile</strong>
              <small>View your organization information</small>
            </span>
            <span className="dashboard-quick-arrow">→</span>
          </button>
        </section>

        <section className="dashboard-recent-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent job postings</h2>
              <p>
                Recruitment opportunities posted by {companyName}.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-text-button"
              onClick={() => navigate("my-jobs")}
            >
              View all jobs →
            </button>
          </div>

          <div className="dashboard-recent-list">
            {recentJobs.map((job) => (
              <article
                className="dashboard-recent-job"
                key={job.id}
              >
                <div className="dashboard-recent-avatar">N</div>

                <div className="dashboard-recent-job-main">
                  <h3>{job.title}</h3>
                  <p>{companyName}</p>
                  <div className="dashboard-job-tags">
                    <span>{job.location || "Location not specified"}</span>
                    <span>{job.type || "Employment type not specified"}</span>
                    <span>{job.mode || "Work arrangement not specified"}</span>
                  </div>
                  <small>
                    Deadline: {formatDate(job.deadline)}
                  </small>
                </div>

                <span
                  className={
                    String(job.status || "Active").toLowerCase() === "closed"
                      ? "dashboard-status closed"
                      : "dashboard-status active"
                  }
                >
                  {job.status || "Active"}
                </span>

                <div className="dashboard-recent-metric">
                  <strong>{Number(job.applications) || 0}</strong>
                  <small>Applications</small>
                </div>

                <div className="dashboard-recent-metric">
                  <strong>{Number(job.views) || 0}</strong>
                  <small>Views</small>
                </div>

                <button
                  type="button"
                  className="dashboard-view-button"
                  onClick={() => {
                    if (typeof onNavigate === "function") {
                      onNavigate("job-details", job);
                    }
                  }}
                >
                  View job
                </button>
              </article>
            ))}

            {recentJobs.length === 0 && (
              <div className="dashboard-empty">
                <h3>No job postings yet</h3>
                <p>
                  Create your first job posting to start building
                  your scientific team.
                </p>
                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() => navigate("post-job")}
                >
                  Post your first job
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="dashboard-bottom-card">
            <span className="dashboard-bottom-icon">✓</span>
            <div>
              <h3>Active recruitment</h3>
              <p>
                {activeJobs.length} open{" "}
                {activeJobs.length === 1 ? "position" : "positions"}{" "}
                available for candidates.
              </p>
            </div>
          </div>

          <div className="dashboard-bottom-card">
            <span className="dashboard-bottom-icon">Ⅱ</span>
            <div>
              <h3>Closed postings</h3>
              <p>
                {closedJobs.length}{" "}
                {closedJobs.length === 1 ? "posting" : "postings"}{" "}
                currently closed.
              </p>
            </div>
          </div>
        </section>

        <p className="dashboard-demo-note">
          Demonstration data is stored in this browser. This frontend
          demo does not use a shared recruitment database.
        </p>
      </div>

      <style>{`
        .dashboard-home {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          color: #102a4c;
        }

        .dashboard-home,
        .dashboard-home * {
          box-sizing: border-box;
        }

        .dashboard-home-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .dashboard-eyebrow {
          display: inline-block;
          color: #2878f5;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.2px;
          margin-bottom: 8px;
        }

        .dashboard-home-header h1 {
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.15;
          letter-spacing: -1px;
          margin: 0 0 10px;
          color: #102a4c;
        }

        .dashboard-home-header p {
          color: #687f9e;
          line-height: 1.6;
          margin: 0;
          font-size: 14px;
        }

        .dashboard-primary-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 46px;
          padding: 0 20px;
          border: 1px solid #347cf6;
          border-radius: 10px;
          background: #347cf6;
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 8px 18px rgba(52, 124, 246, .15);
        }

        .dashboard-primary-button:hover {
          background: #2469df;
        }

        .dashboard-company-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 22px 24px;
          margin-bottom: 22px;
          background: white;
          border: 1px solid #dce6f3;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(26, 60, 100, .035);
        }

        .dashboard-company-avatar,
        .dashboard-recent-avatar {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 13px;
          background: #eaf2ff;
          color: #347cf6;
          font-size: 23px;
          font-weight: 800;
        }

        .dashboard-company-copy {
          min-width: 0;
          flex: 1;
        }

        .dashboard-company-copy > span {
          color: #8294ad;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .dashboard-company-copy h2 {
          font-size: 19px;
          margin: 5px 0;
          color: #102a4c;
        }

        .dashboard-company-copy p {
          font-size: 13px;
          color: #7186a3;
          margin: 0;
        }

        .dashboard-demo-badge {
          background: #edf5ff;
          color: #286fdf;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .dashboard-stat-card {
          background: white;
          border: 1px solid #dce6f3;
          border-radius: 14px;
          padding: 19px;
          min-width: 0;
          box-shadow: 0 8px 25px rgba(26, 60, 100, .025);
        }

        .dashboard-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .dashboard-stat-label {
          color: #6e829e;
          font-size: 12px;
          font-weight: 600;
        }

        .dashboard-stat-symbol {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #edf4ff;
          color: #347cf6;
          font-size: 17px;
          font-weight: 700;
        }

        .dashboard-stat-value {
          display: block;
          margin: 15px 0 5px;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -.7px;
          color: #102a4c;
        }

        .dashboard-stat-description {
          color: #8797ad;
          font-size: 11px;
        }

        .dashboard-quick-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .dashboard-quick-card {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-width: 0;
          padding: 17px;
          text-align: left;
          border: 1px solid #dce6f3;
          border-radius: 13px;
          background: white;
          cursor: pointer;
          color: #102a4c;
        }

        .dashboard-quick-card:hover {
          border-color: #a9c9ff;
          background: #fbfdff;
        }

        .dashboard-quick-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 39px;
          height: 39px;
          background: #edf4ff;
          border-radius: 10px;
          color: #347cf6;
          font-size: 19px;
        }

        .dashboard-quick-card > span:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
          flex: 1;
        }

        .dashboard-quick-card strong {
          font-size: 13px;
        }

        .dashboard-quick-card small {
          color: #788ba5;
          font-size: 11px;
          line-height: 1.5;
        }

        .dashboard-quick-arrow {
          color: #347cf6;
          font-size: 18px;
        }

        .dashboard-recent-section {
          margin-bottom: 22px;
        }

        .dashboard-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .dashboard-section-heading h2 {
          margin: 0 0 6px;
          font-size: 20px;
          color: #102a4c;
        }

        .dashboard-section-heading p {
          margin: 0;
          font-size: 12px;
          color: #778ba5;
        }

        .dashboard-text-button {
          border: 0;
          background: transparent;
          color: #2878f5;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .dashboard-recent-list {
          display: grid;
          gap: 12px;
        }

        .dashboard-recent-job {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          padding: 17px;
          background: white;
          border: 1px solid #dce6f3;
          border-radius: 14px;
        }

        .dashboard-recent-avatar {
          width: 44px;
          height: 44px;
          font-size: 20px;
          border-radius: 11px;
        }

        .dashboard-recent-job-main {
          min-width: 0;
          flex: 1;
        }

        .dashboard-recent-job-main h3 {
          font-size: 14px;
          margin: 0 0 4px;
          color: #102a4c;
        }

        .dashboard-recent-job-main p {
          margin: 0 0 8px;
          color: #6e829e;
          font-size: 11px;
        }

        .dashboard-job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 7px;
        }

        .dashboard-job-tags span {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 5px;
          background: #f1f5fa;
          color: #647b98;
          font-size: 10px;
        }

        .dashboard-recent-job-main > small {
          color: #6e829e;
          font-size: 11px;
        }

        .dashboard-status {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 6px 9px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dashboard-status.active {
          color: #07845c;
          background: #e8f8f1;
        }

        .dashboard-status.closed {
          color: #a34c4c;
          background: #fff0f0;
        }

        .dashboard-recent-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 54px;
        }

        .dashboard-recent-metric strong {
          color: #102a4c;
          font-size: 17px;
        }

        .dashboard-recent-metric small {
          color: #8294ad;
          font-size: 10px;
        }

        .dashboard-view-button {
          padding: 8px 11px;
          border: 1px solid #d3e1f5;
          border-radius: 8px;
          background: white;
          color: #2878f5;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .dashboard-view-button:hover {
          background: #f1f6ff;
        }

        .dashboard-empty {
          padding: 35px 20px;
          text-align: center;
          border: 1px dashed #cbd9eb;
          border-radius: 14px;
          background: white;
        }

        .dashboard-empty h3 {
          margin: 0 0 8px;
        }

        .dashboard-empty p {
          margin: 0 0 18px;
          color: #7186a3;
          font-size: 13px;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .dashboard-bottom-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 18px;
          background: white;
          border: 1px solid #dce6f3;
          border-radius: 13px;
        }

        .dashboard-bottom-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          background: #edf4ff;
          color: #347cf6;
          border-radius: 9px;
          font-weight: 800;
        }

        .dashboard-bottom-card h3 {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .dashboard-bottom-card p {
          margin: 0;
          color: #778ba5;
          font-size: 12px;
          line-height: 1.6;
        }

        .dashboard-demo-note {
          margin: 20px 0 0;
          text-align: center;
          color: #91a0b5;
          font-size: 11px;
        }

        @media (max-width: 1050px) {
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard-recent-job {
            flex-wrap: wrap;
          }

          .dashboard-recent-job-main {
            flex-basis: calc(100% - 75px);
          }

          .dashboard-quick-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-home-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-company-banner {
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 17px;
          }

          .dashboard-demo-badge {
            margin-left: 65px;
          }

          .dashboard-stats-grid {
            gap: 10px;
          }

          .dashboard-stat-card {
            padding: 14px;
          }

          .dashboard-stat-value {
            font-size: 25px;
          }

          .dashboard-section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
