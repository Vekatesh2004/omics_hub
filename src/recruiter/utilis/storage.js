
const RECRUITER_KEY = "omicshub_recruiter";
const JOBS_KEY = "omicshub_recruiter_jobs";
const APPLICATIONS_KEY = "omicshub_recruiter_applications";
const SETTINGS_KEY = "omicshub_recruiter_settings";
const DEMO_SEED_KEY = "omicshub_demo_jobs_seeded_v2";

export const DEMO_COMPANY = "NovaGen Bioinformatics Pvt. Ltd.";

export const demoJobs = [
  {
    id: "demo-novagen-001",
    title: "Bioinformatics Analyst",
    organization: DEMO_COMPANY,
    location: "Bengaluru, India",
    type: "Full-time",
    mode: "Hybrid",
    experience: "0–2 years",
    salary: "₹4–6 LPA",
    deadline: "2026-12-15",
    postedDate: "23 Oct 2026",
    status: "Active",
    applications: 12,
    views: 86,
    skills: ["Python", "R", "RNA-seq", "Linux", "Git"],
    description:
      "Analyse genomic and transcriptomic datasets, perform quality control, develop reproducible bioinformatics workflows, and communicate findings to research teams.",
  },
  {
    id: "demo-novagen-002",
    title: "NGS Data Analyst",
    organization: DEMO_COMPANY,
    location: "Bengaluru, India",
    type: "Full-time",
    mode: "On-site",
    experience: "0–2 years",
    salary: "₹3.5–5 LPA",
    deadline: "2026-12-20",
    postedDate: "23 Oct 2026",
    status: "Active",
    applications: 8,
    views: 64,
    skills: ["NGS", "FastQC", "MultiQC", "Python", "Linux"],
    description:
      "Process next-generation sequencing data, assess sequencing quality, support downstream analysis, and prepare technical reports.",
  },
  {
    id: "demo-novagen-003",
    title: "Junior Computational Biology Intern",
    organization: DEMO_COMPANY,
    location: "Bengaluru, India",
    type: "Internship",
    mode: "Hybrid",
    experience: "Entry level",
    salary: "₹15,000–20,000 per month",
    deadline: "2026-12-31",
    postedDate: "23 Oct 2026",
    status: "Active",
    applications: 5,
    views: 42,
    skills: ["Biology", "Python", "Biopython", "Statistics"],
    description:
      "Assist computational biology projects through biological data preparation, scripting, literature-supported analyses, and documentation of research workflows.",
  },
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
  }
}

export function getRecruiter() {
  return read(RECRUITER_KEY, null);
}

export function saveRecruiter(recruiter) {
  write(RECRUITER_KEY, recruiter);
}

export function getJobs() {
  const stored = read(JOBS_KEY, []);
  const existingJobs = Array.isArray(stored) ? stored : [];
  const seeded = read(DEMO_SEED_KEY, false);

  if (!seeded) {
    const demoIds = new Set(demoJobs.map((job) => job.id));

    // Update older versions of our demo jobs to the consistent company name.
    const migratedJobs = existingJobs.map((job) =>
      demoIds.has(job.id)
        ? { ...job, organization: DEMO_COMPANY }
        : job
    );

    const existingIds = new Set(migratedJobs.map((job) => job.id));

    const missingJobs = demoJobs.filter(
      (job) => !existingIds.has(job.id)
    );

    const mergedJobs = [...migratedJobs, ...missingJobs];

    write(JOBS_KEY, mergedJobs);
    write(DEMO_SEED_KEY, true);

    return mergedJobs;
  }

  return existingJobs;
}

export function saveJobs(jobs) {
  write(JOBS_KEY, Array.isArray(jobs) ? jobs : []);
}

export function getApplications() {
  return read(APPLICATIONS_KEY, []);
}

export function saveApplications(applications) {
  write(
    APPLICATIONS_KEY,
    Array.isArray(applications) ? applications : []
  );
}

export function getSettings() {
  return read(SETTINGS_KEY, {});
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings || {});
}

export function loginRecruiter(credentials = {}) {
  const current = getRecruiter() || {};

  const updated = {
    ...current,
    ...credentials,
    isLoggedIn: true,
    role: "Recruiter",
  };

  saveRecruiter(updated);
  return updated;
}

export function logoutRecruiter() {
  const current = getRecruiter() || {};
  const updated = { ...current, isLoggedIn: false };

  saveRecruiter(updated);
  return updated;
}
