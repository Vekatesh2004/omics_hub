
import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  candidates as demoCandidates,
  applications as demoApplications,
  interviews as demoInterviews,
} from "../data/mockData";

const APP_KEY = "omicshub_recruiter_applications";
const SAVED_KEY = "omicshub_saved_candidates";
const PEOPLE_KEY = "omicshub_candidates";
const INTERVIEW_KEY = "omicshub_recruiter_interviews";
const MESSAGE_KEY = "omicshub_recruiter_messages";
const NOTIFICATION_KEY = "omicshub_recruiter_notifications";
const ASSESSMENT_KEY = "omicshub_assessments";
const SETTINGS_KEY = "omicshub_recruiter_settings";
const PLAN_KEY = "omicshub_plan";

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Unable to save OmicsHub data:", error);
  }
}

function Shell({
  active,
  title,
  subtitle,
  recruiter,
  onNavigate,
  onLogout,
  children,
}) {
  return (
    <Layout
      active={active}
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="page-title">
        <small>OMICSHUB RECRUITER WORKSPACE</small>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </Layout>
  );
}

function Notice({ children, onDismiss }) {
  if (!children) return null;

  return (
    <div className="inline-notice" role="status">
      <span>{children}</span>
      {onDismiss && (
        <button className="link" type="button" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}

function CandidateProfile({ person, onClose }) {
  if (!person) return null;

  const name = person.name || person.candidate || "Candidate";
  const skills = Array.isArray(person.skills) ? person.skills : [];

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="panel modal-panel professional-profile"
        role="dialog"
        aria-modal="true"
        aria-label="Candidate profile"
      >
        <div className="profile-modal-head">
          <div className="candidate-avatar-large">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="status">
              {person.status || "Candidate profile"}
            </span>
            <h2>{name}</h2>
            <p>{person.role || person.job || "Scientific professional"}</p>
          </div>

          <button className="outline" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="profile-detail-grid">
          <div>
            <small>LOCATION</small>
            <strong>{person.location || "Not provided"}</strong>
          </div>
          <div>
            <small>EXPERIENCE</small>
            <strong>{person.experience || "Not provided"}</strong>
          </div>
          <div>
            <small>MATCH SCORE</small>
            <strong>
              {person.match == null ? "Not assessed" : `${person.match}%`}
            </strong>
          </div>
          <div>
            <small>APPLICATION DATE</small>
            <strong>{person.applied || "Not available"}</strong>
          </div>
        </div>

        <div className="profile-section">
          <h3>Professional summary</h3>
          <p>
            {person.summary ||
              person.bio ||
              "No professional summary has been added to this profile."}
          </p>
        </div>

        <div className="profile-section">
          <h3>Skills and specializations</h3>
          {skills.length ? (
            <div className="tags">
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          ) : (
            <p>No skills have been provided for this record.</p>
          )}
        </div>

        <p className="muted">
          This is a demonstration profile stored in the current browser.
        </p>
      </section>
    </div>
  );
}

function CandidateCard({
  person,
  saved,
  onView,
  onSave,
  onShortlist,
}) {
  const name = person.name || "Candidate";

  return (
    <article className="candidate" key={person.id}>
      <div className="candidate-top">
        <i>{name.charAt(0).toUpperCase()}</i>
        <span className="match">{person.match ?? 0}% match</span>
      </div>

      <h3>{name}</h3>
      <p>
        {person.role || "Scientific candidate"} ·{" "}
        {person.location || "Location not specified"}
      </p>

      <div className="tags">
        {(person.skills || []).slice(0, 4).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <small>{person.experience || "Experience not specified"}</small>

      <div className="actions">
        <button className="outline" onClick={() => onView(person)}>
          View Profile
        </button>
        <button className="outline" onClick={() => onSave(person)}>
          {saved ? "Unsave" : "Save"}
        </button>
        <button className="primary" onClick={() => onShortlist(person)}>
          Shortlist
        </button>
      </div>
    </article>
  );
}

function toggleSavedPerson(person) {
  const saved = read(SAVED_KEY, []);
  const exists = saved.some((item) => item.id === person.id);

  const next = exists
    ? saved.filter((item) => item.id !== person.id)
    : [person, ...saved];

  write(SAVED_KEY, next);
  return next;
}

function shortlistPerson(person) {
  const people = read(PEOPLE_KEY, demoCandidates);
  const personExists = people.some((item) => item.id === person.id);

  const updatedPeople = personExists
    ? people.map((item) =>
        item.id === person.id
          ? { ...item, status: "Shortlisted" }
          : item
      )
    : [{ ...person, status: "Shortlisted" }, ...people];

  write(PEOPLE_KEY, updatedPeople);

  const apps = read(APP_KEY, demoApplications);
  const existing = apps.find(
    (item) =>
      item.candidate === person.name &&
      item.job === (person.role || "Scientific role")
  );

  const next = existing
    ? apps.map((item) =>
        item.id === existing.id
          ? { ...item, status: "Shortlisted" }
          : item
      )
    : [
        {
          id: `APP-${Date.now()}`,
          candidate: person.name,
          job: person.role || "Scientific role",
          status: "Shortlisted",
          applied: new Date().toLocaleDateString("en-GB"),
          match: person.match || 0,
        },
        ...apps,
      ];

  write(APP_KEY, next);
  window.alert(`${person.name} has been shortlisted.`);
}

export function Candidates({ recruiter, onNavigate, onLogout }) {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState(() =>
    read(PEOPLE_KEY, demoCandidates)
  );
  const [saved, setSaved] = useState(() => read(SAVED_KEY, []));

  const filtered = people.filter((person) =>
    `${person.name} ${person.role} ${person.location} ${(person.skills || []).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const shortlist = (person) => {
    const next = people.some((item) => item.id === person.id)
      ? people.map((item) =>
          item.id === person.id
            ? { ...item, status: "Shortlisted" }
            : item
        )
      : [{ ...person, status: "Shortlisted" }, ...people];

    setPeople(next);
    write(PEOPLE_KEY, next);
    shortlistPerson(person);
  };

  return (
    <Shell
      active="candidates"
      title="Candidates"
      subtitle="Review scientific talent and identify strong matches."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search candidate, skill or location..."
        />
        <span>{filtered.length} candidates</span>
      </div>

      <div className="cards">
        {filtered.map((person) => (
          <CandidateCard
            key={person.id}
            person={person}
            saved={saved.some((item) => item.id === person.id)}
            onView={setProfile}
            onSave={(item) => setSaved(toggleSavedPerson(item))}
            onShortlist={shortlist}
          />
        ))}
      </div>

      {!filtered.length && (
        <div className="panel empty">No candidates match your search.</div>
      )}

      <CandidateProfile
        person={profile}
        onClose={() => setProfile(null)}
      />
    </Shell>
  );
}

export function Applications({ recruiter, onNavigate, onLogout }) {
  const [items, setItems] = useState(() =>
    read(APP_KEY, demoApplications)
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [profile, setProfile] = useState(null);

  const statuses = [
    "Applied",
    "Screening",
    "Shortlisted",
    "Interview",
    "Hired",
    "Rejected",
  ];

  const updateStatus = (id, status) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, status } : item
    );

    setItems(next);
    write(APP_KEY, next);

    if (status === "Shortlisted") {
      const application = items.find((item) => item.id === id);
      const people = read(PEOPLE_KEY, demoCandidates);
      const person = people.find(
        (item) => item.name === application?.candidate
      );

      if (person) {
        write(
          PEOPLE_KEY,
          people.map((item) =>
            item.id === person.id
              ? { ...item, status: "Shortlisted" }
              : item
          )
        );
      }
    }
  };

  const filtered = items.filter(
    (item) =>
      `${item.candidate} ${item.job}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All" || item.status === filter)
  );

  const openProfile = (application) => {
    const person = read(PEOPLE_KEY, demoCandidates).find(
      (item) => item.name === application.candidate
    );

    setProfile({
      ...(person || {}),
      ...application,
      name: application.candidate,
      role: application.job,
      skills: person?.skills || [],
      location: person?.location || "",
      experience: person?.experience || "",
      match: application.match ?? person?.match ?? 0,
    });
  };

  return (
    <Shell
      active="applications"
      title="Applications"
      subtitle="Review applicants and manage recruitment stages."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search candidate or job..."
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          {["All", ...statuses].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <span>{filtered.length} results</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Match</th>
              <th>Applied</th>
              <th>Stage</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td><b>{item.candidate}</b></td>
                <td>{item.job}</td>
                <td>{item.match ?? 0}%</td>
                <td>{item.applied || "—"}</td>
                <td>
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateStatus(item.id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="outline"
                    onClick={() => openProfile(item)}
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <p className="empty">No applications match your filters.</p>
        )}
      </div>

      <CandidateProfile
        person={profile}
        onClose={() => setProfile(null)}
      />
    </Shell>
  );
}

export function Shortlisted({ recruiter, onNavigate, onLogout }) {
  const [items, setItems] = useState(() =>
    read(APP_KEY, demoApplications).filter(
      (item) => item.status === "Shortlisted"
    )
  );
  const [undoItem, setUndoItem] = useState(null);
  const [profile, setProfile] = useState(null);

  const returnToScreening = (item) => {
    const all = read(APP_KEY, demoApplications);
    const next = all.map((entry) =>
      entry.id === item.id
        ? { ...entry, status: "Screening" }
        : entry
    );

    write(APP_KEY, next);
    setItems(next.filter((entry) => entry.status === "Shortlisted"));
    setUndoItem(item);
  };

  const undoReturn = () => {
    if (!undoItem) return;

    const all = read(APP_KEY, demoApplications);
    const next = all.map((entry) =>
      entry.id === undoItem.id
        ? { ...entry, status: "Shortlisted" }
        : entry
    );

    write(APP_KEY, next);
    setItems(next.filter((entry) => entry.status === "Shortlisted"));
    setUndoItem(null);
  };

  return (
    <Shell
      active="shortlisted"
      title="Shortlisted Candidates"
      subtitle="Candidates selected for further review."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setUndoItem(null)}>
        {undoItem
          ? `${undoItem.candidate} was returned to Screening.`
          : ""}
      </Notice>

      {undoItem && (
        <div className="actions">
          <button className="outline" onClick={undoReturn}>
            Undo
          </button>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Match</th>
              <th>Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><b>{item.candidate}</b></td>
                <td>{item.job}</td>
                <td>{item.match ?? 0}%</td>
                <td>{item.applied || "—"}</td>
                <td>
                  <div className="actions">
                    <button
                      className="outline"
                      onClick={() =>
                        setProfile({
                          ...item,
                          name: item.candidate,
                          role: item.job,
                          skills: [],
                        })
                      }
                    >
                      View Profile
                    </button>
                    <button
                      className="outline"
                      onClick={() => returnToScreening(item)}
                    >
                      Return to Screening
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && (
          <p className="empty">No shortlisted candidates yet.</p>
        )}
      </div>

      <CandidateProfile
        person={profile}
        onClose={() => setProfile(null)}
      />
    </Shell>
  );
}

function toDateInput(value) {
  if (!value) return "";

  const match = String(value).match(
    /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/
  );

  if (match) {
    const months = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec",
    ];
    const month =
      months.indexOf(match[2].slice(0, 3).toLowerCase()) + 1;

    if (month > 0) {
      return `${match[3]}-${String(month).padStart(2, "0")}-${String(
        match[1]
      ).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

function toTimeInput(value) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return "10:00";

  let hour = Number(match[1]);
  const lower = String(value).toLowerCase();

  if (lower.includes("pm") && hour < 12) hour += 12;
  if (lower.includes("am") && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${match[2]}`;
}

export function Interviews({ recruiter, onNavigate, onLogout }) {
  const [items, setItems] = useState(() =>
    read(INTERVIEW_KEY, demoInterviews)
  );
  const [editing, setEditing] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [notice, setNotice] = useState("");

  const persist = (next) => {
    setItems(next);
    write(INTERVIEW_KEY, next);
  };

  const startReschedule = (index) => {
    const item = items[index];

    setNotice("");
    setCanceling(null);
    setEditing({
      index,
      date: toDateInput(item[0]),
      time: toTimeInput(item[1]),
      original: item,
    });
  };

  const saveReschedule = (event) => {
    event.preventDefault();

    if (!editing?.date || !editing?.time) {
      setNotice("Please select both a date and a time.");
      return;
    }

    const dateLabel = new Date(
      `${editing.date}T12:00:00`
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const next = items.map((item, index) =>
      index === editing.index
        ? [dateLabel, editing.time, ...item.slice(2)]
        : item
    );

    persist(next);
    setNotice(`Interview rescheduled for ${editing.original[2]}.`);
    setEditing(null);
  };

  const confirmCancel = () => {
    if (canceling === null) return;

    const item = items[canceling];
    persist(items.filter((_, index) => index !== canceling));
    setEditing(null);
    setCanceling(null);
    setNotice(`Interview for ${item[2]} was cancelled.`);
  };

  return (
    <Shell
      active="interviews"
      title="Interview Schedule"
      subtitle="Coordinate candidate interviews and manage scheduling."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setNotice("")}>{notice}</Notice>

      {editing && (
        <section className="panel schedule-editor">
          <div className="panel-head">
            <div>
              <small>SCHEDULE CHANGE</small>
              <h2>Reschedule interview</h2>
              <p>{editing.original[2]} · {editing.original[3]}</p>
            </div>
            <button
              className="outline"
              onClick={() => setEditing(null)}
            >
              Close
            </button>
          </div>

          <form className="two" onSubmit={saveReschedule}>
            <label>
              New date
              <input
                type="date"
                value={editing.date}
                onChange={(event) =>
                  setEditing({ ...editing, date: event.target.value })
                }
                required
              />
            </label>

            <label>
              New time
              <input
                type="time"
                value={editing.time}
                onChange={(event) =>
                  setEditing({ ...editing, time: event.target.value })
                }
                required
              />
            </label>

            <div className="actions end full">
              <button
                type="button"
                className="outline"
                onClick={() => setEditing(null)}
              >
                Discard Changes
              </button>
              <button className="primary" type="submit">
                Save New Schedule
              </button>
            </div>
          </form>
        </section>
      )}

      {canceling !== null && (
        <section className="panel cancel-confirm">
          <h3>Cancel this interview?</h3>
          <p>
            This will remove the interview for{" "}
            <b>{items[canceling]?.[2]}</b> from the current schedule.
          </p>
          <div className="actions">
            <button
              className="outline"
              onClick={() => setCanceling(null)}
            >
              Keep Interview
            </button>
            <button className="danger" onClick={confirmCancel}>
              Confirm Cancellation
            </button>
          </div>
        </section>
      )}

      <div className="list">
        {items.map((item, index) => (
          <article
            className="interview professional-interview"
            key={`${item[2]}-${index}`}
          >
            <div className="date large">
              <b>{String(item[0]).split(" ")[0]}</b>
              <small>
                {String(item[0]).split(" ")[1]?.slice(0, 3) || "DATE"}
              </small>
            </div>

            <div className="interview-main">
              <span className="status">Scheduled</span>
              <h3>{item[2]}</h3>
              <p>{item[3]}</p>
              <div className="interview-meta">
                <span>◷ {item[1]}</span>
                <span>▣ {item[4] || "Interview"}</span>
              </div>
            </div>

            <div className="interview-actions">
              <button
                className="outline"
                onClick={() => startReschedule(index)}
              >
                Reschedule
              </button>
              <button
                className="danger"
                onClick={() => {
                  setEditing(null);
                  setCanceling(index);
                  setNotice("");
                }}
              >
                Cancel Interview
              </button>
            </div>
          </article>
        ))}

        {!items.length && (
          <div className="panel empty">
            <h3>No interviews scheduled</h3>
            <p>Scheduled candidate interviews will appear here.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

export function Assessments({ recruiter, onNavigate, onLogout }) {
  const defaults = [
    {
      id: "as1",
      title: "Bioinformatics Fundamentals",
      category: "Bioinformatics",
      duration: 30,
      assigned: 18,
      completed: 13,
      score: 82,
      active: true,
    },
    {
      id: "as2",
      title: "NGS & Variant Analysis",
      category: "Genomics",
      duration: 45,
      assigned: 12,
      completed: 8,
      score: 76,
      active: true,
    },
    {
      id: "as3",
      title: "Scientific Data Analysis",
      category: "Data Analysis",
      duration: 40,
      assigned: 21,
      completed: 17,
      score: 84,
      active: false,
    },
  ];

  const [items, setItems] = useState(() =>
    read(ASSESSMENT_KEY, defaults)
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    category: "Bioinformatics",
    duration: "30",
  });

  const persist = (next) => {
    setItems(next);
    write(ASSESSMENT_KEY, next);
  };

  const createAssessment = (event) => {
    event.preventDefault();

    if (!draft.title.trim()) return;

    persist([
      {
        id: `AS-${Date.now()}`,
        title: draft.title.trim(),
        category: draft.category,
        duration: Number(draft.duration),
        assigned: 0,
        completed: 0,
        score: 0,
        active: true,
      },
      ...items,
    ]);

    setDraft({
      title: "",
      category: "Bioinformatics",
      duration: "30",
    });
    setShowCreate(false);
    setNotice("Assessment created successfully.");
  };

  const filtered = items.filter(
    (item) =>
      `${item.title} ${item.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Active" && item.active) ||
        (filter === "Paused" && !item.active))
  );

  return (
    <Shell
      active="assessments"
      title="Assessments"
      subtitle="Manage technical evaluations and monitor candidate progress."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setNotice("")}>{notice}</Notice>

      <div className="assessment-summary">
        <article className="stat">
          <b>{items.length}</b>
          <strong>Total assessments</strong>
          <small>Assessment library</small>
        </article>
        <article className="stat">
          <b>{items.filter((item) => item.active).length}</b>
          <strong>Active assessments</strong>
          <small>Available for use</small>
        </article>
        <article className="stat">
          <b>{items.reduce((sum, item) => sum + item.assigned, 0)}</b>
          <strong>Assignments</strong>
          <small>Across assessments</small>
        </article>
        <article className="stat">
          <b>{items.reduce((sum, item) => sum + item.completed, 0)}</b>
          <strong>Completions</strong>
          <small>Submitted assessments</small>
        </article>
      </div>

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assessments..."
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Paused</option>
        </select>
        <button
          className="primary"
          onClick={() => setShowCreate((current) => !current)}
        >
          + Create Assessment
        </button>
      </div>

      {showCreate && (
        <form className="panel form" onSubmit={createAssessment}>
          <h2>Create assessment</h2>

          <div className="two">
            <label>
              Assessment title
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                required
              />
            </label>

            <label>
              Category
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
              >
                <option>Bioinformatics</option>
                <option>Genomics</option>
                <option>Data Analysis</option>
                <option>Laboratory Skills</option>
                <option>Programming</option>
              </select>
            </label>

            <label>
              Duration (minutes)
              <input
                type="number"
                min="5"
                max="240"
                value={draft.duration}
                onChange={(event) =>
                  setDraft({ ...draft, duration: event.target.value })
                }
                required
              />
            </label>
          </div>

          <div className="actions end">
            <button
              type="button"
              className="outline"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
            <button className="primary">Create Assessment</button>
          </div>
        </form>
      )}

      <div className="cards assessment-cards">
        {filtered.map((item) => {
          const completion = item.assigned
            ? Math.round((item.completed / item.assigned) * 100)
            : 0;

          return (
            <article className="panel assessment-card" key={item.id}>
              <div className="assessment-card-top">
                <i className="feature-icon">✓</i>
                <span className={item.active ? "status" : "status paused"}>
                  {item.active ? "Active" : "Paused"}
                </span>
              </div>

              <small className="assessment-category">{item.category}</small>
              <h2>{item.title}</h2>
              <p>{item.duration} minutes · Technical assessment</p>

              <div className="mini-grid">
                <b>{item.assigned}<small>Assigned</small></b>
                <b>{item.completed}<small>Completed</small></b>
                <b>{item.score}%<small>Average score</small></b>
                <b>{completion}%<small>Completion rate</small></b>
              </div>

              <div className="assessment-progress">
                <div>
                  <span>Completion progress</span>
                  <b>{completion}%</b>
                </div>
                <em>
                  <i style={{ width: `${completion}%` }} />
                </em>
              </div>

              <button
                className={item.active ? "outline" : "primary"}
                onClick={() =>
                  persist(
                    items.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, active: !entry.active }
                        : entry
                    )
                  )
                }
              >
                {item.active ? "Pause Assessment" : "Activate Assessment"}
              </button>
            </article>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="panel empty">No assessments match your filters.</div>
      )}
    </Shell>
  );
}

export function TalentSearch({ recruiter, onNavigate, onLogout }) {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(() => read(SAVED_KEY, []));
  const [profile, setProfile] = useState(null);
  const people = read(PEOPLE_KEY, demoCandidates);

  const filtered = people.filter((person) =>
    `${person.name} ${person.role} ${person.location} ${(person.skills || []).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <Shell
      active="talent-search"
      title="Talent Search"
      subtitle="Find candidates by skill, role or specialization."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="search-hero">
        <h2>Discover scientific talent</h2>
        <p>Search across skills, roles and candidate specializations.</p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Python, RNA-seq, genomics or NGS..."
        />
        <div className="search-chips">
          {["Bioinformatics", "NGS", "Python", "Genomics"].map((skill) => (
            <button
              className="outline"
              key={skill}
              onClick={() => setQuery(skill)}
            >
              {skill}
            </button>
          ))}
          <button className="outline" onClick={() => setQuery("")}>
            Clear
          </button>
        </div>
      </div>

      <p className="muted">{filtered.length} matching profiles</p>

      <div className="cards">
        {filtered.map((person) => (
          <CandidateCard
            key={person.id}
            person={person}
            saved={saved.some((item) => item.id === person.id)}
            onView={setProfile}
            onSave={(item) => setSaved(toggleSavedPerson(item))}
            onShortlist={shortlistPerson}
          />
        ))}
      </div>

      {!filtered.length && (
        <div className="panel empty">No matching talent found.</div>
      )}

      <CandidateProfile
        person={profile}
        onClose={() => setProfile(null)}
      />
    </Shell>
  );
}

const sampleSavedCandidates = [
  {
    id: "saved-101",
    name: "Aarav Sharma",
    role: "Bioinformatics Analyst",
    location: "Bengaluru, India",
    experience: "2 years",
    skills: ["Python", "RNA-seq", "Linux", "BLAST"],
    match: 94,
    status: "Available",
  },
  {
    id: "saved-102",
    name: "Riya Kumar",
    role: "Genomics Research Associate",
    location: "Hyderabad, India",
    experience: "3 years",
    skills: ["NGS", "Variant Analysis", "R", "GATK"],
    match: 91,
    status: "Available",
  },
  {
    id: "saved-103",
    name: "Priya Singh",
    role: "Computational Biologist",
    location: "Pune, India",
    experience: "4 years",
    skills: ["Python", "Linux", "Nextflow", "RNA-seq"],
    match: 89,
    status: "Open to opportunities",
  },
  {
    id: "saved-104",
    name: "Karan Mehta",
    role: "Clinical Genomics Associate",
    location: "Chennai, India",
    experience: "2 years",
    skills: ["Variant Interpretation", "ACMG", "NGS", "R"],
    match: 87,
    status: "Available",
  },
];

export function Saved({ recruiter, onNavigate, onLogout }) {
  const [items, setItems] = useState(() => {
    const existing = read(SAVED_KEY, null);

    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }

    write(SAVED_KEY, sampleSavedCandidates);
    return sampleSavedCandidates;
  });
  const [profile, setProfile] = useState(null);

  const remove = (person) => {
    const next = items.filter((item) => item.id !== person.id);
    setItems(next);
    write(SAVED_KEY, next);
  };

  return (
    <Shell
      active="saved-candidates"
      title="Saved Candidates"
      subtitle="Profiles you want to revisit."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      {items.length ? (
        <div className="cards">
          {items.map((person) => (
            <CandidateCard
              key={person.id}
              person={person}
              saved
              onView={setProfile}
              onSave={remove}
              onShortlist={shortlistPerson}
            />
          ))}
        </div>
      ) : (
        <div className="panel empty">
          <h3>No saved candidates yet</h3>
          <p>Save profiles from Candidates or Talent Search.</p>
          <button
            className="primary"
            onClick={() => onNavigate("talent-search")}
          >
            Search Talent
          </button>
        </div>
      )}

      <CandidateProfile
        person={profile}
        onClose={() => setProfile(null)}
      />
    </Shell>
  );
}

function normalizeMessages(items) {
  return items
    .map((item) => {
      let messages = Array.isArray(item.messages)
        ? item.messages
        : (item.replies || []).map((reply) => ({
            sender: "recruiter",
            text: reply.text,
            date: reply.date || "Previously sent",
          }));

      if (!messages.length && item.last) {
        messages = [
          {
            sender: "candidate",
            text: item.last,
            date: "Previous message",
          },
        ];
      }

      return {
        ...item,
        updatedAt: Number(item.updatedAt) || 0,
        messages,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function Messages({ recruiter, onNavigate, onLogout }) {
  const defaultThreads = [
    {
      id: "m1",
      name: "Aarav Sharma",
      last: "Thank you for the opportunity.",
      updatedAt: 3,
      messages: [
        {
          sender: "candidate",
          text: "Thank you for the opportunity.",
          date: "Today",
        },
      ],
    },
    {
      id: "m2",
      name: "Riya Kumar",
      last: "I am available for the technical interview.",
      updatedAt: 2,
      messages: [
        {
          sender: "candidate",
          text: "I am available for the technical interview.",
          date: "Yesterday",
        },
      ],
    },
    {
      id: "m3",
      name: "Priya Singh",
      last: "I have shared my availability.",
      updatedAt: 1,
      messages: [
        {
          sender: "candidate",
          text: "I have shared my availability.",
          date: "Yesterday",
        },
      ],
    },
  ];

  const [items, setItems] = useState(() =>
    normalizeMessages(read(MESSAGE_KEY, defaultThreads))
  );
  const [selected, setSelected] = useState(
    () => read(MESSAGE_KEY, defaultThreads)[0]?.id || "m1"
  );
  const [reply, setReply] = useState("");
  const [compose, setCompose] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [newText, setNewText] = useState("");
  const [notice, setNotice] = useState("");

  const active = items.find((item) => item.id === selected);

  const persist = (next) => {
    const normalized = normalizeMessages(next);
    setItems(normalized);
    write(MESSAGE_KEY, normalized);
  };

  const sendReply = (event) => {
    event.preventDefault();
    if (!reply.trim() || !active) return;

    const message = {
      sender: "recruiter",
      text: reply.trim(),
      date: new Date().toLocaleString(),
    };

    persist(
      items.map((item) =>
        item.id === selected
          ? {
              ...item,
              last: message.text,
              updatedAt: Date.now(),
              messages: [...item.messages, message],
            }
          : item
      )
    );

    setReply("");
    setNotice("Message added to the local conversation.");
  };

  const sendNewMessage = (event) => {
    event.preventDefault();
    if (!recipient.trim() || !newText.trim()) return;

    const message = {
      sender: "recruiter",
      text: newText.trim(),
      date: new Date().toLocaleString(),
    };

    const existing = items.find(
      (item) =>
        item.name.toLowerCase() === recipient.trim().toLowerCase()
    );

    let next;
    let targetId;

    if (existing) {
      targetId = existing.id;
      next = items.map((item) =>
        item.id === targetId
          ? {
              ...item,
              last: message.text,
              updatedAt: Date.now(),
              messages: [...item.messages, message],
            }
          : item
      );
    } else {
      targetId = `msg-${Date.now()}`;
      next = [
        {
          id: targetId,
          name: recipient.trim(),
          last: message.text,
          updatedAt: Date.now(),
          messages: [message],
        },
        ...items,
      ];
    }

    persist(next);
    setSelected(targetId);
    setCompose(false);
    setRecipient("");
    setNewText("");
    setNotice("Message saved in the local workspace.");
  };

  return (
    <Shell
      active="messages"
      title="Messages"
      subtitle="Manage candidate communication in one workspace."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setNotice("")}>{notice}</Notice>

      <div className="messages-heading">
        <div>
          <h2>Candidate conversations</h2>
          <p>Recently updated conversations appear first.</p>
        </div>
        <button
          className="primary"
          onClick={() => setCompose((current) => !current)}
        >
          + New Message
        </button>
      </div>

      {compose && (
        <form className="panel compose-panel" onSubmit={sendNewMessage}>
          <h3>Compose message</h3>

          <label>
            Candidate name
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="Enter candidate name"
              required
            />
          </label>

          <label>
            Message
            <textarea
              value={newText}
              onChange={(event) => setNewText(event.target.value)}
              placeholder="Write your message..."
              rows="4"
              required
            />
          </label>

          <div className="actions end">
            <button
              type="button"
              className="outline"
              onClick={() => setCompose(false)}
            >
              Cancel
            </button>
            <button className="primary">Send Message</button>
          </div>
        </form>
      )}

      <div className="message-layout">
        <aside className="messages">
          {items.map((item) => (
            <button
              className={selected === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <i>{(item.name || "C").charAt(0).toUpperCase()}</i>
              <span>
                <b>{item.name}</b>
                <small>Candidate conversation</small>
                <em>{item.last}</em>
              </span>
            </button>
          ))}

          {!items.length && <p>No conversations yet.</p>}
        </aside>

        {active ? (
          <section className="panel message-panel">
            <div className="conversation-heading">
              <div className="candidate-avatar">
                {active.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{active.name}</h2>
                <p>Candidate conversation</p>
              </div>
            </div>

            <div className="message-history">
              {active.messages.map((message, index) => (
                <div
                  className={`chat-message ${
                    message.sender === "recruiter" ? "sent" : "received"
                  }`}
                  key={`${message.date}-${index}`}
                >
                  <span>
                    {message.sender === "recruiter"
                      ? recruiter?.recruiterName || "Recruiter"
                      : active.name}
                  </span>
                  <p>{message.text}</p>
                  <small>{message.date}</small>
                </div>
              ))}
            </div>

            <form className="reply-form" onSubmit={sendReply}>
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={`Write a message to ${active.name}...`}
                rows="3"
                required
              />
              <button className="primary">Send Message →</button>
            </form>
          </section>
        ) : (
          <section className="panel empty">
            <h3>Select a conversation</h3>
            <p>Choose a candidate to view the conversation.</p>
          </section>
        )}
      </div>
    </Shell>
  );
}

export function Analytics({ recruiter, onNavigate, onLogout }) {
  const applications = read(APP_KEY, demoApplications);
  const counts = [
    "Applied",
    "Screening",
    "Shortlisted",
    "Interview",
    "Hired",
    "Rejected",
  ].map((status) => ({
    status,
    count: applications.filter((item) => item.status === status).length,
  }));

  const exportCSV = () => {
    const rows = [
      ["Candidate", "Job", "Status", "Match", "Applied"],
      ...applications.map((item) => [
        item.candidate,
        item.job,
        item.status,
        `${item.match ?? 0}%`,
        item.applied || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "omicshub-recruitment-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell
      active="analytics"
      title="Recruitment Analytics"
      subtitle="Review pipeline activity and export application records."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="stats four">
        {[
          [applications.length, "Applications"],
          [counts.find((item) => item.status === "Shortlisted").count, "Shortlisted"],
          [counts.find((item) => item.status === "Interview").count, "Interviews"],
          [counts.find((item) => item.status === "Hired").count, "Hired"],
        ].map(([value, title]) => (
          <article className="stat" key={title}>
            <b>{value}</b>
            <strong>{title}</strong>
            <small>Current workspace data</small>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Application Pipeline</h2>
            <p>Applications grouped by current stage.</p>
          </div>
          <button className="primary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>

        {counts.map((item) => {
          const percentage = applications.length
            ? Math.round((item.count / applications.length) * 100)
            : 0;

          return (
            <div className="funnel" key={item.status}>
              <div>
                <span>{item.status}</span>
                <b>{item.count}</b>
              </div>
              <em>
                <i style={{ width: `${percentage}%` }} />
              </em>
            </div>
          );
        })}
      </section>
    </Shell>
  );
}

export function Notifications({ recruiter, onNavigate, onLogout }) {
  const defaults = [
    {
      id: "n1",
      title: "New application received",
      body: "A candidate applied for Bioinformatics Analyst.",
      read: false,
      date: "Today",
    },
    {
      id: "n2",
      title: "Candidate shortlisted",
      body: "A candidate moved to Shortlisted.",
      read: false,
      date: "Today",
    },
    {
      id: "n3",
      title: "Interview reminder",
      body: "A technical interview is approaching.",
      read: true,
      date: "Yesterday",
    },
  ];

  const [items, setItems] = useState(() =>
    read(NOTIFICATION_KEY, defaults)
  );

  const update = (next) => {
    setItems(next);
    write(NOTIFICATION_KEY, next);
  };

  return (
    <Shell
      active="notifications"
      title="Notifications"
      subtitle="Stay up to date with recruitment activity."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="actions end">
        <button
          className="outline"
          onClick={() =>
            update(items.map((item) => ({ ...item, read: true })))
          }
        >
          Mark All Read
        </button>
        <button className="danger" onClick={() => update([])}>
          Clear All
        </button>
      </div>

      <div className="list">
        {items.map((item) => (
          <article className="notification" key={item.id}>
            <i>{item.read ? "✓" : "♢"}</i>
            <div>
              <b>{item.title}</b>
              <p>{item.body}</p>
              <small>
                {item.date} · {item.read ? "Read" : "Unread"}
              </small>
            </div>
            <button
              className="outline"
              onClick={() =>
                update(
                  items.map((entry) =>
                    entry.id === item.id
                      ? { ...entry, read: !entry.read }
                      : entry
                  )
                )
              }
            >
              Mark {item.read ? "Unread" : "Read"}
            </button>
          </article>
        ))}

        {!items.length && (
          <div className="panel empty">You're all caught up.</div>
        )}
      </div>
    </Shell>
  );
}

export function Billing({ recruiter, onNavigate, onLogout }) {
  const [plan, setPlan] = useState(() => read(PLAN_KEY, "Recruiter Free"));
  const [message, setMessage] = useState("");

  const upgrade = () => {
    const next = "Recruiter Pro (Demo)";
    setPlan(next);
    write(PLAN_KEY, next);
    setMessage("Demo plan updated. No payment was processed.");
  };

  return (
    <Shell
      active="billing"
      title="Billing"
      subtitle="Review your demo workspace plan and usage."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setMessage("")}>{message}</Notice>

      <div className="billing">
        <article className="panel">
          <small>CURRENT PLAN</small>
          <h2>{plan}</h2>
          <div className="price">
            ₹0 <small>/ month · demo</small>
          </div>
          <p>This frontend demo does not process payments.</p>
          <ul>
            <li>Job management</li>
            <li>Candidate management</li>
            <li>Application pipeline</li>
            <li>Recruitment analytics</li>
          </ul>
          <button
            className="primary"
            onClick={upgrade}
            disabled={plan.includes("Pro")}
          >
            {plan.includes("Pro") ? "Pro Plan Selected" : "Try Pro (Demo)"}
          </button>
        </article>

        <article className="panel">
          <h2>Workspace Usage</h2>
          {[
            ["Active jobs", "5 / 10", 50],
            ["Talent searches", "28 / 100", 28],
            ["Team members", "1 / 3", 33],
          ].map(([label, value, percentage]) => (
            <div className="usage" key={label}>
              <div>
                <span>{label}</span>
                <b>{value}</b>
              </div>
              <em>
                <i style={{ width: `${percentage}%` }} />
              </em>
            </div>
          ))}
        </article>
      </div>
    </Shell>
  );
}

export function Generic({
  active,
  title,
  subtitle,
  recruiter,
  onNavigate,
  onLogout,
}) {
  return (
    <Shell
      active={active}
      title={title}
      subtitle={subtitle}
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="panel empty">
        <h3>{title}</h3>
        <p>This module is available in the frontend demo workspace.</p>
        <button
          className="primary"
          onClick={() => onNavigate("dashboard")}
        >
          Return to Dashboard
        </button>
      </div>
    </Shell>
  );
}

export function Profile({ recruiter, onNavigate, onLogout }) {
  const company = recruiter || {};

  const details = [
    ["Organization", company.companyName],
    ["Industry", company.industry],
    ["Company size", company.companySize],
    ["Headquarters", company.location],
    ["Website", company.website],
    ["Work email", company.email],
    ["Contact number", company.phone],
    ["Recruiter", company.recruiterName],
  ];

  return (
    <Shell
      active="profile"
      title="Company Profile"
      subtitle="Your organization's public-facing recruiter information."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <section className="company-hero">
        <div className="company-logo">
          {(company.companyName || "O").charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="status">Recruiter account</span>
          <h2>{company.companyName || "Your Organization"}</h2>
          <p>
            {company.industry || "Life Sciences"} ·{" "}
            {company.location || "Location not provided"}
          </p>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer">
              {company.website}
            </a>
          )}
        </div>
      </section>

      <div className="company-profile-grid">
        <section className="panel">
          <h2>Organization overview</h2>
          <p className="company-bio">
            {company.bio ||
              "An organization overview has not been provided yet. Company information entered during registration will appear here."}
          </p>
        </section>

        <section className="panel">
          <h2>Company information</h2>
          <div className="company-details">
            {details.map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value || "Not provided"}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="profile-footer-note">
        Company information is displayed from the current recruiter account.
      </p>
    </Shell>
  );
}

export function Settings({
  recruiter,
  settings = {},
  onSettings,
  onNavigate,
  onLogout,
}) {
  const [form, setForm] = useState(() => ({
    emailNotifications: true,
    applicationAlerts: true,
    marketingEmails: false,
    interviewReminders: true,
    weeklySummary: false,
    defaultDashboard: false,
    ...read(SETTINGS_KEY, {}),
    ...settings,
  }));

  const [notice, setNotice] = useState("");

  const options = [
    [
      "emailNotifications",
      "Email notifications",
      "Receive important updates about your recruiter workspace.",
    ],
    [
      "applicationAlerts",
      "Application alerts",
      "Get notified when candidates apply for your jobs.",
    ],
    [
      "interviewReminders",
      "Interview reminders",
      "Keep track of upcoming interviews and schedule changes.",
    ],
    [
      "weeklySummary",
      "Weekly recruitment summary",
      "Review a weekly overview of your hiring activity.",
    ],
    [
      "marketingEmails",
      "Product updates",
      "Receive product announcements and tips.",
    ],
    [
      "defaultDashboard",
      "Open dashboard by default",
      "Prefer the dashboard as your starting workspace page.",
    ],
  ];

  const save = (event) => {
    event.preventDefault();
    write(SETTINGS_KEY, form);
    if (onSettings) onSettings(form);
    setNotice("Your preferences have been saved.");
  };

  const reset = () => {
    setForm({
      emailNotifications: true,
      applicationAlerts: true,
      marketingEmails: false,
      interviewReminders: true,
      weeklySummary: false,
      defaultDashboard: false,
    });
  };

  return (
    <Shell
      active="settings"
      title="Settings"
      subtitle="Manage your account preferences and workspace notifications."
      recruiter={recruiter}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Notice onDismiss={() => setNotice("")}>{notice}</Notice>

      <form onSubmit={save} className="settings-page">
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <i className="feature-icon">♙</i>
            <div>
              <h2>Account information</h2>
              <p>Information associated with your recruiter account.</p>
            </div>
          </div>

          <div className="settings-account-row">
            <div className="candidate-avatar-large">
              {(recruiter?.recruiterName || "R").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{recruiter?.recruiterName || "Recruiter"}</strong>
              <p>{recruiter?.email || "Email not provided"}</p>
              <small>
                {recruiter?.companyName || "Organization not provided"}
              </small>
            </div>
            <button
              type="button"
              className="outline"
              onClick={() => onNavigate("profile")}
            >
              View Company Profile
            </button>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="settings-section-heading">
            <i className="feature-icon">♢</i>
            <div>
              <h2>Notifications and communication</h2>
              <p>Choose which updates you want to receive.</p>
            </div>
          </div>

          <div className="settings-options">
            {options.map(([key, title, description]) => (
              <label className="setting-option" key={key}>
                <span>
                  <b>{title}</b>
                  <small>{description}</small>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <div className="actions end">
          <button type="button" className="outline" onClick={reset}>
            Reset Preferences
          </button>
          <button className="primary" type="submit">
            Save Settings
          </button>
        </div>
      </form>
    </Shell>
  );
}
