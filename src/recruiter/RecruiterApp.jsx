
import React, { useEffect, useState } from "react";

import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobPage from "./pages/JobPage";

import {
  Candidates,
  Applications,
  Shortlisted,
  Interviews,
  Assessments,
  TalentSearch,
  Saved,
  Messages,
  Analytics,
  Notifications,
  Billing,
  Generic,
  Profile,
  Settings,
} from "./pages/Workspace";

import {
  DEMO_COMPANY,
  getRecruiter,
  saveRecruiter,
  getJobs,
  saveJobs,
  getApplications,
  loginRecruiter,
  logoutRecruiter,
  getSettings,
  saveSettings,
} from "./utilis/storage";

const PAGE_TITLES = {
  candidates: ["Candidates", "Explore scientific talent."],
  applications: ["Applications", "Review and manage applications."],
  shortlisted: ["Shortlisted", "Your shortlisted candidates."],
  interviews: ["Interviews", "Manage interview schedules."],
  assessments: ["Assessments", "Manage candidate assessments."],
  "talent-search": ["Talent Search", "Find scientific professionals."],
  "saved-candidates": ["Saved Candidates", "Your saved talent."],
  messages: ["Messages", "Communicate with candidates."],
  analytics: ["Analytics", "Review recruitment performance."],
  notifications: ["Notifications", "Your recruiter updates."],
  billing: ["Billing", "Manage your plan and usage."],
  profile: ["Company Profile", "Manage your organization information."],
  settings: ["Settings", "Manage your workspace preferences."],
};

export default function RecruiterApp() {
  const [recruiter, setRecruiter] = useState(() => getRecruiter());
  const [page, setPage] = useState(() =>
    getRecruiter() ? "dashboard" : "login"
  );
  const [jobs, setJobs] = useState(() => getJobs());
  const [applications] = useState(() => getApplications());
  const [selectedJob, setSelectedJob] = useState(null);
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    setJobs(getJobs());
  }, []);

  // Keep browser Back/Forward navigation inside the React app.
  useEffect(() => {
    window.history.replaceState({ omicsHubPage: page }, "", window.location.href);

    const handlePopState = (event) => {
      const nextPage = event.state?.omicsHubPage;
      if (nextPage) {
        setPage(nextPage);
      } else {
        setPage(getRecruiter() ? "dashboard" : "login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // Install the listener once; navigation is handled by handleNavigate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNavigate(nextPage, job = null) {
    if (!nextPage) return;

    if (job) setSelectedJob(job);

    setPage(nextPage);

    window.history.pushState(
      { omicsHubPage: nextPage },
      "",
      window.location.href
    );
  }

  function handleLogin(credentials) {
    const result = loginRecruiter(credentials);

    if (result && !result.error) {
      setRecruiter(result);
      setPage("dashboard");
      setJobs(getJobs());
      window.history.pushState(
        { omicsHubPage: "dashboard" },
        "",
        window.location.href
      );
      return result;
    }

    return result || { error: "Unable to sign in. Check your details." };
  }

  function handleRegister(details) {
    const newRecruiter = {
      ...details,
      companyName:
        details.companyName || details.organization || DEMO_COMPANY,
    };

    saveRecruiter(newRecruiter);
    setRecruiter(newRecruiter);
    setPage("dashboard");
    setJobs(getJobs());

    window.history.pushState(
      { omicsHubPage: "dashboard" },
      "",
      window.location.href
    );
  }

  function handleLogout() {
    logoutRecruiter();
    setRecruiter(null);
    setSelectedJob(null);
    setPage("login");

    window.history.pushState(
      { omicsHubPage: "login" },
      "",
      window.location.href
    );
  }

  function handleCreateJob(newJob) {
    const updatedJobs = [
      {
        ...newJob,
        id: newJob.id || `job-${Date.now()}`,
        organization:
          newJob.organization ||
          recruiter?.companyName ||
          DEMO_COMPANY,
        status: newJob.status || "Active",
        createdAt: newJob.createdAt || new Date().toISOString(),
      },
      ...getJobs(),
    ];

    saveJobs(updatedJobs);
    setJobs(updatedJobs);
    setSelectedJob(null);
    handleNavigate("my-jobs");
  }

  function handleUpdateJob(updatedJob) {
    const updatedJobs = getJobs().map((job) =>
      String(job.id) === String(updatedJob.id)
        ? { ...job, ...updatedJob }
        : job
    );

    saveJobs(updatedJobs);
    setJobs(updatedJobs);
    setSelectedJob(updatedJob);
    handleNavigate("my-jobs");
  }

  function handleDeleteJob(jobId) {
    const updatedJobs = getJobs().filter(
      (job) => String(job.id) !== String(jobId)
    );

    saveJobs(updatedJobs);
    setJobs(updatedJobs);

    if (String(selectedJob?.id) === String(jobId)) {
      setSelectedJob(null);
      handleNavigate("my-jobs");
    }
  }

  function handleToggleJob(jobId) {
    const updatedJobs = getJobs().map((job) =>
      String(job.id) === String(jobId)
        ? {
            ...job,
            status: job.status === "Closed" ? "Active" : "Closed",
          }
        : job
    );

    saveJobs(updatedJobs);
    setJobs(updatedJobs);
  }

  function handleSettings(nextSettings) {
    const updated = { ...settings, ...nextSettings };
    setSettings(updated);
    saveSettings(updated);
  }

  if (page === "login" || (!recruiter && page !== "register")) {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => handleNavigate("register")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onLogin={() => handleNavigate("login")}
      />
    );
  }

  const commonProps = {
    recruiter,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
  };

  if (page === "dashboard") {
    return (
      <Dashboard
        {...commonProps}
        jobs={jobs}
        applications={applications}
      />
    );
  }

  if (
    ["my-jobs", "post-job", "edit-job", "job-details"].includes(page)
  ) {
    return (
      <JobPage
        {...commonProps}
        page={page}
        jobs={jobs}
        selected={selectedJob}
        onCreate={handleCreateJob}
        onUpdate={handleUpdateJob}
        onView={(job) => handleNavigate("job-details", job)}
        onEdit={(job) => handleNavigate("edit-job", job)}
        onDelete={handleDeleteJob}
        onToggle={handleToggleJob}
      />
    );
  }

  const workspaceProps = {
    ...commonProps,
  };

  switch (page) {
    case "candidates":
      return <Candidates {...workspaceProps} />;
    case "applications":
      return <Applications {...workspaceProps} />;
    case "shortlisted":
      return <Shortlisted {...workspaceProps} />;
    case "interviews":
      return <Interviews {...workspaceProps} />;
    case "assessments":
      return <Assessments {...workspaceProps} />;
    case "talent-search":
      return <TalentSearch {...workspaceProps} />;
    case "saved-candidates":
      return <Saved {...workspaceProps} />;
    case "messages":
      return <Messages {...workspaceProps} />;
    case "analytics":
      return <Analytics {...workspaceProps} />;
    case "notifications":
      return <Notifications {...workspaceProps} />;
    case "billing":
      return <Billing {...workspaceProps} />;
    case "profile":
      return <Profile {...workspaceProps} />;
    case "settings":
      return (
        <Settings
          {...workspaceProps}
          settings={settings}
          onSettings={handleSettings}
        />
      );
    default: {
      const [title, subtitle] = PAGE_TITLES[page] || [
        "Recruiter Workspace",
        "Choose a section from the sidebar.",
      ];

      return (
        <Generic
          {...workspaceProps}
          active={page}
          title={title}
          subtitle={subtitle}
        />
      );
    }
  }
}
