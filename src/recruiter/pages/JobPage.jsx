
import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import {
  DEMO_COMPANY,
  demoJobs as fallbackDemoJobs,
} from "../utilis/storage";

function getCompanyName(recruiter) {
  return String(
    recruiter?.companyName ||
      recruiter?.organization ||
      DEMO_COMPANY
  ).trim();
}

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

function toDateInput(value) {
  if (!value) return "";

  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function JobForm({
  recruiter,
  job,
  onNavigate,
  onLogout,
  onSubmit,
}) {
  const companyName = getCompanyName(recruiter);

  const [form, setForm] = useState({
    title: job?.title || "",
    location: job?.location || "",
    type: job?.type || "Full-time",
    mode: job?.mode || "Hybrid",
    experience: job?.experience || "0–2 years",
    salary: job?.salary || "",
    deadline: toDateInput(job?.deadline),
    skills: Array.isArray(job?.skills)
      ? job.skills.join(", ")
      : job?.skills || "",
    description: job?.description || "",
  });

  const [error, setError] = useState("");

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (new Date(`${form.deadline}T00:00:00`) < today) {
        setError("The application deadline cannot be in the past.");
        return;
      }
    }

    onSubmit({
      ...job,
      id: job?.id || `job-${Date.now()}`,
      title: form.title.trim(),
      organization: companyName,
      location: form.location.trim(),
      type: form.type,
      mode: form.mode,
      experience: form.experience,
      salary: form.salary.trim() || "Negotiable",
      deadline: form.deadline,
      postedDate: job?.postedDate || formatDate(new Date().toISOString()),
      status: job?.status || "Active",
      applications: job?.applications || 0,
      views: job?.views || 0,
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      description: form.description.trim(),
    });
  }

  return (
    <Layout
      active={job ? "my-jobs" : "post-job"}
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="page-title">
        <small>JOB MANAGEMENT</small>
        <h1>{job ? "Edit Job" : "Post a New Job"}</h1>
        <p>
          Create a recruitment opportunity for {companyName}.
        </p>
      </div>

      <form className="panel form job-form" onSubmit={submit}>
        <div className="form-section-heading">
          <h2>Role information</h2>
          <p>Basic details about the position.</p>
        </div>

        <div className="two">
          <label>
            Job title *
            <input
              name="title"
              value={form.title}
              onChange={change}
              placeholder="e.g. Bioinformatics Analyst"
              required
            />
          </label>

          <label>
            Company / Institution *
            <input value={companyName} readOnly />
          </label>

          <label>
            Location *
            <input
              name="location"
              value={form.location}
              onChange={change}
              placeholder="e.g. Bengaluru, India"
              required
            />
          </label>

          <label>
            Employment type
            <select name="type" value={form.type} onChange={change}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Temporary</option>
            </select>
          </label>

          <label>
            Work arrangement
            <select name="mode" value={form.mode} onChange={change}>
              <option>On-site</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </label>

          <label>
            Experience required
            <select
              name="experience"
              value={form.experience}
              onChange={change}
            >
              <option>Entry level</option>
              <option>0–2 years</option>
              <option>2–5 years</option>
              <option>5–8 years</option>
              <option>8+ years</option>
            </select>
          </label>

          <label>
            Salary / compensation
            <input
              name="salary"
              value={form.salary}
              onChange={change}
              placeholder="e.g. ₹4–6 LPA or Negotiable"
            />
          </label>

          <label>
            Application deadline
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={change}
              min={toDateInput(new Date().toISOString())}
            />
            <small>Select the last date candidates can apply.</small>
          </label>

          <label className="full">
            Required skills
            <input
              name="skills"
              value={form.skills}
              onChange={change}
              placeholder="Python, R, RNA-seq, Linux"
            />
            <small>Separate skills with commas.</small>
          </label>

          <label className="full">
            Job description *
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={6}
              placeholder="Describe responsibilities, qualifications and expectations..."
              required
            />
          </label>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions end">
          <button
            type="button"
            className="outline"
            onClick={() => onNavigate("my-jobs")}
          >
            Cancel
          </button>

          <button type="submit" className="primary">
            {job ? "Save Changes" : "Publish Job"}
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default function JobPage({
  page,
  recruiter,
  onNavigate,
  onLogout,
  jobs = [],
  demoJobs = [],
  selected,
  onCreate,
  onUpdate,
  onView,
  onEdit,
  onDelete,
  onToggle,
}) {
  const companyName = getCompanyName(recruiter);
  const companyKey = companyName.toLowerCase();

  const allJobs = useMemo(() => {
    const supplied = Array.isArray(jobs) ? jobs : [];
    const extraDemo = Array.isArray(demoJobs) ? demoJobs : [];

    const merged = [...supplied];
    const ids = new Set(merged.map((job) => String(job.id)));

    for (const job of [...extraDemo, ...fallbackDemoJobs]) {
      if (!ids.has(String(job.id))) {
        merged.push(job);
        ids.add(String(job.id));
      }
    }

    // Ensure all built-in demo jobs consistently use one company.
    return merged.map((job) =>
      String(job.id).startsWith("demo-novagen-")
        ? { ...job, organization: DEMO_COMPANY }
        : job
    );
  }, [jobs, demoJobs]);

  const companyJobs = useMemo(
    () =>
      allJobs.filter((job) => {
        const organization = String(job.organization || "")
          .trim()
          .toLowerCase();

        const isDemo = String(job.id || "").startsWith("demo-novagen-");

        return organization === companyKey || isDemo;
      }),
    [allJobs, companyKey]
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredJobs = useMemo(
    () =>
      companyJobs.filter((job) => {
        const searchText = [
          job.title,
          job.organization,
          job.location,
          ...(Array.isArray(job.skills) ? job.skills : []),
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchText.includes(query.trim().toLowerCase()) &&
          (statusFilter === "All" || job.status === statusFilter)
        );
      }),
    [companyJobs, query, statusFilter]
  );

  function confirmDelete(job) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${job.title}"?\n\nThis action cannot be undone.`
    );

    if (confirmed && typeof onDelete === "function") {
      onDelete(job.id);
    }
  }

  function toggleJob(job) {
    if (typeof onToggle === "function") {
      onToggle(job.id);
    }
  }

  if (page === "post-job") {
    return (
      <JobForm
        recruiter={recruiter}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onSubmit={onCreate}
      />
    );
  }

  if (page === "edit-job") {
    if (!selected) {
      return (
        <Layout
          active="my-jobs"
          recruiter={recruiter}
          onNavigate={onNavigate}
          onLogout={onLogout}
        >
          <div className="panel empty">
            <h2>No job selected</h2>
            <button className="primary" onClick={() => onNavigate("my-jobs")}>
              Back to Jobs
            </button>
          </div>
        </Layout>
      );
    }

    return (
      <JobForm
        key={selected.id}
        recruiter={recruiter}
        job={selected}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onSubmit={onUpdate}
      />
    );
  }

  if (page === "job-details") {
    const job = selected || companyJobs[0];

    if (!job) {
      return (
        <Layout
          active="my-jobs"
          recruiter={recruiter}
          onNavigate={onNavigate}
          onLogout={onLogout}
        >
          <div className="panel empty">
            <h2>No job selected</h2>
            <button className="primary" onClick={() => onNavigate("my-jobs")}>
              Back to Jobs
            </button>
          </div>
        </Layout>
      );
    }

    const skills = Array.isArray(job.skills)
      ? job.skills
      : String(job.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    return (
      <Layout
        active="my-jobs"
        recruiter={recruiter}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <button
          className="link back"
          onClick={() => onNavigate("my-jobs")}
        >
          ← Back to Jobs
        </button>

        <div className="page-title">
          <small>JOB DETAILS</small>
          <h1>{job.title}</h1>
          <p>{job.organization} · {job.location}</p>
        </div>

        <div className="details">
          <section className="panel">
            <div className="job-detail-heading">
              <div className="company-letter">
                {(job.organization || "N").charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="status">{job.status || "Active"}</span>
                <h2>{job.title}</h2>
                <p>{job.organization}</p>
              </div>
            </div>

            <div className="mini-grid">
              <div>
                <strong>{job.applications || 0}</strong>
                <small>Applications</small>
              </div>
              <div>
                <strong>{job.views || 0}</strong>
                <small>Views</small>
              </div>
              <div>
                <strong>{job.type || "Not specified"}</strong>
                <small>Employment type</small>
              </div>
              <div>
                <strong>{job.mode || "Not specified"}</strong>
                <small>Work arrangement</small>
              </div>
            </div>

            <h3>About the role</h3>
            <p className="job-description">{job.description}</p>

            <h3>Required skills</h3>
            <div className="tags">
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <aside className="panel posting-panel">
            <h2>Posting overview</h2>
            <p className="posting-intro">
              Key information about this vacancy.
            </p>

            <div className="posting-details">
              {[
                ["Posting status", job.status || "Active"],
                ["Posted on", formatDate(job.postedDate)],
                ["Application deadline", formatDate(job.deadline)],
                ["Experience required", job.experience || "Not specified"],
                ["Compensation", job.salary || "Negotiable"],
                ["Employment type", job.type || "Not specified"],
                ["Work arrangement", job.mode || "Not specified"],
              ].map(([label, value]) => (
                <div className="posting-detail" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="posting-actions">
              <button className="primary full" onClick={() => onEdit?.(job)}>
                Edit Job
              </button>
              <button className="outline full" onClick={() => toggleJob(job)}>
                {job.status === "Closed" ? "Reopen Job" : "Close Job"}
              </button>
              <button className="danger full" onClick={() => confirmDelete(job)}>
                Delete Job
              </button>
            </div>
          </aside>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      active="my-jobs"
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="page-title">
        <small>JOB MANAGEMENT</small>
        <h1>Manage Jobs</h1>
        <p>View, edit and manage recruitment opportunities.</p>
      </div>

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search job title, skills or location..."
          aria-label="Search jobs"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by job status"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>

        <button className="primary" onClick={() => onNavigate("post-job")}>
          + Post Job
        </button>
      </div>

      <div className="company-jobs-heading">
        <div>
          <small>RECRUITER ORGANIZATION</small>
          <h2>{companyName}</h2>
        </div>
        <span>
          {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "posting" : "postings"}
        </span>
      </div>

      <div className="jobs">
        {filteredJobs.map((job) => (
          <article className="job" key={job.id}>
            <div className="company-letter">
              {(job.organization || "N").charAt(0).toUpperCase()}
            </div>

            <div className="job-summary">
              <h3>{job.title}</h3>
              <p>{job.organization}</p>
              <div className="tags">
                <span>{job.location}</span>
                <span>{job.type}</span>
                <span>{job.mode}</span>
              </div>
              <small>Deadline: {formatDate(job.deadline)}</small>
            </div>

            <span className="status">{job.status || "Active"}</span>

            <div className="job-metric">
              <strong>{job.applications || 0}</strong>
              <small>Applications</small>
            </div>

            <div className="job-metric">
              <strong>{job.views || 0}</strong>
              <small>Views</small>
            </div>

            <div className="job-row-actions">
              <button className="outline" onClick={() => onView?.(job)}>
                View
              </button>
              <button className="outline" onClick={() => onEdit?.(job)}>
                Edit
              </button>
              <button className="danger" onClick={() => confirmDelete(job)}>
                Delete
              </button>
            </div>
          </article>
        ))}

        {filteredJobs.length === 0 && (
          <div className="panel empty">
            <h2>No jobs found</h2>
            <p>Try another search or post a new recruitment opportunity.</p>
            <button className="primary" onClick={() => onNavigate("post-job")}>
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
