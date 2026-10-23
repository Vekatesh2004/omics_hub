const STORAGE_KEY = "omicsHubBasicProfile";

const TOTAL_STEPS = 6;



/* ---------- STATE ---------- */



function defaultState() {

    return {

        academic: { fullName: "", degree: "", discipline: "", institution: "", department: "", cgpa: "", gradYear: "" },

        interests: { primary: [], secondary: [] },

        goals: { list: [], note: "" },

        preferredJobs: [],

        skills: { certs: [], tools: [], techniques: [] },

        links: { linkedin: "", github: "", portfolio: "" },

        resume: null,           // { name, size, date }

        savedSteps: [],         // steps the student has saved

        completed: false

    };

}



let state = loadState();

let currentStep = 1;



function loadState() {

    try {

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved) return Object.assign(defaultState(), saved);

    } catch (e) { /* ignore */ }

    return defaultState();

}



function saveState() {

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }

}



/* ---------- HELPERS ---------- */



const $ = (sel, root = document) => root.querySelector(sel);

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));



function esc(text) {

    const d = document.createElement("div");

    d.textContent = String(text == null ? "" : text);

    return d.innerHTML;

}



function getPath(path) {

    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), state);

}



function setPath(path, value) {

    const keys = path.split(".");

    const last = keys.pop();

    const target = keys.reduce((o, k) => o[k], state);

    target[last] = value;

}



function titleCase(s) {

    return s.replace(/\b\w/g, c => c.toUpperCase());

}



/* =====================================================

   TAG INPUTS

===================================================== */



function initTagFields() {

    $$(".tag-field").forEach(field => {

        const path = field.dataset.path;

        const input = $("input", field);

        const addBtn = $(".add-btn", field);

        const suggestBox = $(".suggest", field);

        const suggestions = (field.dataset.suggest || "").split(",").map(s => s.trim()).filter(Boolean);



        function addTag(value) {

            value = value.trim();

            if (!value) return;

            const list = getPath(path);

            if (list.some(v => v.toLowerCase() === value.toLowerCase())) return;

            list.push(value);

            saveState();

            renderTags(field);

        }



        field._addTag = addTag;



        addBtn.addEventListener("click", () => { addTag(input.value); input.value = ""; input.focus(); });



        input.addEventListener("keydown", e => {

            if (e.key === "Enter" || e.key === ",") {

                e.preventDefault();

                addTag(input.value);

                input.value = "";

            }

        });



        // suggestion chips

        if (suggestions.length) {

            suggestBox.innerHTML = "<small>Suggestions:</small>";

            suggestions.forEach(s => {

                const chip = document.createElement("button");

                chip.type = "button";

                chip.className = "chip";

                chip.textContent = "+ " + s;

                chip.addEventListener("click", () => addTag(s));

                suggestBox.appendChild(chip);

            });

        }



        renderTags(field);

    });

}



function renderTags(field) {

    const path = field.dataset.path;

    const box = $(".tags", field);

    box.innerHTML = "";

    getPath(path).forEach((value, index) => {

        const tag = document.createElement("span");

        tag.className = "tag";

        tag.innerHTML = esc(value) + ' <button type="button" aria-label="Remove">×</button>';

        $("button", tag).addEventListener("click", () => {

            getPath(path).splice(index, 1);

            saveState();

            renderTags(field);

        });

        box.appendChild(tag);

    });

}



// Add any text still typed in a tag box (user forgot to press Add)

function commitPendingTags(panel) {

    $$(".tag-field", panel).forEach(field => {

        const input = $("input", field);

        if (input.value.trim()) {

            field._addTag(input.value);

            input.value = "";

        }

    });

}



/* =====================================================

   WIZARD

===================================================== */



function fillForms() {

    const a = state.academic;

    ["fullName", "degree", "discipline", "institution", "department", "cgpa", "gradYear"]

        .forEach(id => { $("#" + id).value = a[id] || ""; });



    $$('input[name="goal"]').forEach(cb => { cb.checked = state.goals.list.includes(cb.value); });

    $("#goalNote").value = state.goals.note || "";



    $("#linkedin").value = state.links.linkedin || "";

    $("#github").value = state.links.github || "";

    $("#portfolio").value = state.links.portfolio || "";



    renderResumeInfo();

}



function renderResumeInfo() {

    const info = $("#resumeFileInfo");

    info.textContent = state.resume

        ? "Current file: " + state.resume.name + " (" + formatSize(state.resume.size) + ")"

        : "No resume uploaded yet.";

}



function formatSize(bytes) {

    return bytes > 1048576 ? (bytes / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(bytes / 1024)) + " KB";

}



function showStep(n) {

    currentStep = n;

    $$(".step-panel").forEach(p => p.classList.toggle("hidden", Number(p.dataset.step) !== n));

    updateWizardNav();

    window.scrollTo(0, 0);

}



function updateWizardNav() {

    $$("#wizardNav .nav-item").forEach(btn => {

        const s = Number(btn.dataset.step);

        btn.classList.toggle("active", s === currentStep);

        btn.classList.toggle("done", state.savedSteps.includes(s) && s !== currentStep);

    });

    const count = state.savedSteps.length;

    $("#wizardProgress").style.width = (count / TOTAL_STEPS * 100) + "%";

    $("#wizardProgressText").textContent = count + " of " + TOTAL_STEPS + " saved";

}



/* ---------- Read form values into state ---------- */



function collectStep(n) {

    const panel = $('.step-panel[data-step="' + n + '"]');

    commitPendingTags(panel);



    if (n === 1) {

        ["fullName", "degree", "discipline", "institution", "department", "cgpa", "gradYear"]

            .forEach(id => { state.academic[id] = $("#" + id).value.trim(); });

    }

    if (n === 3) {

        state.goals.list = $$('input[name="goal"]:checked').map(cb => cb.value);

        state.goals.note = $("#goalNote").value.trim();

    }

    if (n === 6) {

        ["linkedin", "github", "portfolio"].forEach(id => {

            const fixed = normaliseUrl($("#" + id).value);

            $("#" + id).value = fixed;      // show the corrected link

            state.links[id] = fixed;

        });

    }

    saveState();

}



// Adds https:// when the student types a link like "www\.linkedin.com/in/name"

function normaliseUrl(value) {
    value = String(value || "").trim();
    if (value && !/^https?:\/\//i.test(value)) {
        value = "https://" + value;
    }
    return value;
}



/* ---------- Validation (returns error text or "") ---------- */



function isUrl(value) {

    try { const u = new URL(value); return u.protocol === "http:" || u.protocol === "https:"; }

    catch (e) { return false; }

}



function validateStep(n) {

    if (n === 1) {

        const a = state.academic;

        if (!a.degree || !a.discipline || !a.institution || !a.department || a.cgpa === "" || a.gradYear === "")

            return "Please fill in all fields marked with *.";

        const cgpa = Number(a.cgpa);

        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return "CGPA must be between 0 and 10.";

        const yr = Number(a.gradYear);

        if (!Number.isInteger(yr) || yr < 2020 || yr > 2040) return "Enter a valid graduation year (2020 - 2040).";

    }

    if (n === 2 && state.interests.primary.length === 0)

        return "Add at least one primary interest.";

    if (n === 3 && state.goals.list.length === 0)

        return "Select at least one career goal.";

    if (n === 4 && state.preferredJobs.length === 0)

        return "Add at least one preferred job role.";

    if (n === 5) {

        const s = state.skills;

        if (s.certs.length + s.tools.length + s.techniques.length === 0)

            return "Add at least one certificate, tool or technique.";

    }

    if (n === 6) {

        const l = state.links;

        if (l.linkedin && (!isUrl(l.linkedin) || !/^https?:\/\/(www\.)?linkedin\.com\/in\/[^/]+\/?$/i.test(l.linkedin)))

            return "Enter a valid LinkedIn URL, e.g. linkedin.com/in/your-name";

        if (l.github && !isUrl(l.github)) return "Enter a valid GitHub URL (starting with https://).";

        if (l.portfolio && !isUrl(l.portfolio)) return "Enter a valid portfolio URL (starting with https://).";

    }

    return "";

}



function showError(panel, msg) {

    const box = $(".error-msg", panel);

    box.textContent = "⚠ " + msg;

    box.classList.remove("hidden");

}



function clearError(panel) {

    $(".error-msg", panel).classList.add("hidden");

}



function initWizard() {

    // Submit (Save & Continue / Finish)

    $$(".step-panel").forEach(panel => {

        const n = Number(panel.dataset.step);



        panel.addEventListener("submit", e => {

            e.preventDefault();

            collectStep(n);

            const error = validateStep(n);

            if (error) { showError(panel, error); return; }

            clearError(panel);



            if (!state.savedSteps.includes(n)) state.savedSteps.push(n);

            saveState();



            if (n < TOTAL_STEPS) {

                showStep(n + 1);

            } else {

                // FINISH

                state.completed = true;

                saveState();

                showDashboard();

            }

        });



        const back = $(".back-btn", panel);

        if (back) back.addEventListener("click", () => { collectStep(n); showStep(n - 1); });

    });



    // Sidebar step buttons

    $$("#wizardNav .nav-item").forEach(btn => {

        btn.addEventListener("click", () => {

            collectStep(currentStep);

            showStep(Number(btn.dataset.step));

        });

    });



    // Resume file (step 6)

    $("#resumeFile").addEventListener("change", e => {

        const file = e.target.files[0];

        if (!file) return;

        const err = checkResumeFile(file);

        const panel = $('.step-panel[data-step="6"]');

        if (err) { showError(panel, err); e.target.value = ""; return; }

        clearError(panel);

        state.resume = { name: file.name, size: file.size, date: new Date().toISOString() };

        saveState();

        renderResumeInfo();

    });

}



function checkResumeFile(file) {

    if (!/\.(pdf|doc|docx)$/i.test(file.name)) return "Resume must be a PDF, DOC or DOCX file.";

    if (file.size > 5 * 1024 * 1024) return "Resume must be smaller than 5 MB.";

    return "";

}



/* =====================================================

   DASHBOARD DATA

===================================================== */



const ROLES = [

    {

        title: "Bioinformatics Analyst",

        skills: ["python", "r", "sql", "linux", "ngs analysis", "statistics", "genomics"],

        keywords: ["bioinformatics", "analyst", "genomic"],

        domains: ["bioinformatic", "genom", "ngs", "omics", "biolog"]

    },

    {

        title: "Computational Biologist",

        skills: ["python", "r", "machine learning", "statistics", "genomics", "git", "linux"],

        keywords: ["computational", "biologist", "bioinformatics"],

        domains: ["bioinformatic", "computational", "genom", "biolog", "machine learning"]

    },

    {

        title: "Research Associate",

        skills: ["scientific writing", "statistics", "r", "python", "ngs analysis", "literature review"],

        keywords: ["research", "scientist", "associate"],

        domains: ["research", "academia", "phd", "biolog"]

    },

    {

        title: "Data Analyst",

        skills: ["sql", "excel", "python", "statistics", "data visualization", "tableau"],

        keywords: ["data analyst", "analytics", "data"],

        domains: ["data", "analytics", "statistic"]

    },

    {

        title: "Machine Learning Engineer",

        skills: ["python", "machine learning", "deep learning", "tensorflow", "git", "sql", "docker"],

        keywords: ["machine learning", "ml", "ai", "deep learning"],

        domains: ["machine learning", "ai", "deep learning", "data science"]

    },

    {

        title: "Web Developer",

        skills: ["html", "css", "javascript", "git", "react", "sql"],

        keywords: ["web", "frontend", "front-end", "website"],

        domains: ["web", "website", "frontend", "tool development"]

    },

    {

        title: "Software Developer (Bioinformatics Tools)",

        skills: ["python", "git", "linux", "docker", "javascript", "sql", "nextflow"],

        keywords: ["software", "developer", "tool", "engineer"],

        domains: ["tool", "software", "development", "website"]

    }

];



const TRAINING = {

    "python": { title: "Python for Bioinformatics", mode: "Online", note: "Programming for biological data analysis." },

    "r": { title: "Data Analysis with R", mode: "Online", note: "R programming and statistical analysis." },

    "sql": { title: "SQL for Data Analysis", mode: "Online", note: "Query and manage relational databases." },

    "linux": { title: "Linux & Shell Scripting for Bioinformatics", mode: "Hybrid", note: "Command line skills for omics pipelines." },

    "git": { title: "Git & GitHub Essentials", mode: "Online", note: "Version control and collaboration." },

    "docker": { title: "Docker for Reproducible Research", mode: "Online", note: "Containers for pipelines and tools." },

    "ngs analysis": { title: "NGS Data Analysis Training", mode: "Hybrid", note: "Hands-on sequencing data workflows." },

    "genomics": { title: "Genomics Fundamentals", mode: "Online", note: "Genome structure, variants and annotation." },

    "statistics": { title: "Biostatistics Basics", mode: "Online", note: "Statistics for biological data." },

    "machine learning": { title: "Machine Learning Introduction", mode: "Hybrid", note: "Core ML techniques and workflows." },

    "deep learning": { title: "Deep Learning Foundations", mode: "Online", note: "Neural networks for biology and data." },

    "tensorflow": { title: "TensorFlow for Beginners", mode: "Online", note: "Build and train models." },

    "html": { title: "HTML & CSS for Websites", mode: "Online", note: "Build web pages from scratch." },

    "css": { title: "HTML & CSS for Websites", mode: "Online", note: "Style responsive web pages." },

    "javascript": { title: "JavaScript Programming Training", mode: "Online", note: "Interactive websites and tools." },

    "react": { title: "React for Web Applications", mode: "Online", note: "Build modern user interfaces." },

    "excel": { title: "Excel for Data Analysis", mode: "Online", note: "Formulas, pivots and charts." },

    "tableau": { title: "Data Visualization with Tableau", mode: "Online", note: "Dashboards and visual storytelling." },

    "data visualization": { title: "Data Visualization Essentials", mode: "Online", note: "Present data clearly." },

    "scientific writing": { title: "Scientific Writing Workshop", mode: "Online", note: "Papers, abstracts and proposals." },

    "literature review": { title: "Literature Review & Research Methods", mode: "Online", note: "Find and organise research papers." },

    "nextflow": { title: "Nextflow Pipeline Development", mode: "Hybrid", note: "Build scalable bioinformatics pipelines." }

};



const ALIASES = {

    "js": "javascript", "ml": "machine learning", "dl": "deep learning",

    "ngs": "ngs analysis", "next generation sequencing": "ngs analysis",

    "stats": "statistics", "biostatistics": "statistics",

    "html5": "html", "css3": "css", "reactjs": "react", "react.js": "react",

    "ms excel": "excel", "microsoft excel": "excel", "power bi": "tableau"

};



function normalise(skill) {

    const s = skill.toLowerCase().trim();

    return ALIASES[s] || s;

}



function userSkillList() {

    const all = [].concat(state.skills.certs, state.skills.tools, state.skills.techniques);

    return all.map(normalise);

}



function hasSkill(userSkills, required) {

    return userSkills.some(s => {

        if (s === required) return true;

        if (s.length < 3 || required.length < 3) return false; // avoid "r" matching everything

        return s.includes(required) || required.includes(s);

    });

}



function scoreRole(role, userSkills) {

    const matched = role.skills.filter(s => hasSkill(userSkills, s));

    const missing = role.skills.filter(s => !hasSkill(userSkills, s));



    const prefText = state.preferredJobs.join(" ").toLowerCase();

    const prefHit = role.keywords.some(k => prefText.includes(k));



    const primary = state.interests.primary.join(" ").toLowerCase();

    const secondary = state.interests.secondary.join(" ").toLowerCase();

    const primaryHit = role.domains.some(d => primary.includes(d));

    const secondaryHit = role.domains.some(d => secondary.includes(d));



    let score = (matched.length / role.skills.length) * 65;

    if (prefHit) score += 15;

    if (primaryHit) score += 14; else if (secondaryHit) score += 8;

    if (state.preferredJobs.some(j => j.toLowerCase() === role.title.toLowerCase())) score += 6;



    return { role, matched, missing, score: Math.min(100, Math.round(score)) };

}



function computeRecommendations() {

    const skills = userSkillList();

    return ROLES.map(r => scoreRole(r, skills)).sort((a, b) => b.score - a.score);

}



function computeSkillGaps(results) {

    const top = results.slice(0, 3);

    const counts = {};

    top.forEach(r => r.missing.forEach(s => {

        counts[s] = counts[s] || { skill: s, roles: [] };

        counts[s].roles.push(r.role.title);

    }));

    return Object.values(counts)

        .sort((a, b) => b.roles.length - a.roles.length)

        .slice(0, 8);

}



/* =====================================================

   RENDER DASHBOARD

===================================================== */



function showDashboard() {

    $("#wizard").classList.add("hidden");

    $("#dashboard").classList.remove("hidden");

    $("#wizardNav").classList.add("hidden");

    $("#dashNav").classList.remove("hidden");



    const name = state.academic.fullName || "Student";

    $("#pageTitle").textContent = "Welcome, " + name;

    $("#pageSub").textContent = "Your Basic Career Development Dashboard";



    renderDashboard();

    window.scrollTo(0, 0);

}



function showWizard() {

    $("#dashboard").classList.add("hidden");

    $("#wizard").classList.remove("hidden");

    $("#dashNav").classList.add("hidden");

    $("#wizardNav").classList.remove("hidden");

    $("#pageTitle").textContent = "Build your profile";

    $("#pageSub").textContent = "Fill in your details so we can recommend roles, skills and training.";

    fillForms();

    showStep(1);

}



function renderDashboard() {

    const results = computeRecommendations();

    const gaps = computeSkillGaps(results);

    const a = state.academic;

    const allSkills = [].concat(state.skills.certs, state.skills.tools, state.skills.techniques);



    /* Overview */

    $("#welcomeText").textContent = "Hello, " + (a.fullName || "Student") + " 👋";

    $("#profileLine").textContent =

        a.degree + " " + a.discipline + " - " + a.department + ", " + a.institution +

        " | CGPA " + a.cgpa + " | Graduating " + a.gradYear;



    const best = results[0];

    $("#statsRow").innerHTML =

        stat(best ? best.score + "%" : "-", "Best role match") +

        stat(allSkills.length, "Skills added") +

        stat(gaps.length, "Skill gaps found") +

        stat(state.goals.list.length, "Career goals");



    /* Recommended roles */

    $("#rolesList").innerHTML = results.slice(0, 4).map(r => {

        const level = r.score >= 70 ? "Strong match" : r.score >= 40 ? "Moderate match" : "Developing match";

        return '<div class="role">' +

            '<div class="role-head"><h3>' + esc(r.role.title) + '</h3><span class="match-badge">' + r.score + '% match</span></div>' +

            '<div class="match-bar"><div style="width:' + r.score + '%"></div></div>' +

            '<p class="role-level">' + level + '</p>' +

            pills("You have", r.matched, false) +

            pills("Missing", r.missing, true) +

            '</div>';

    }).join("");



    /* Skill gap */

    $("#gapList").innerHTML = gaps.length

        ? gaps.map(g =>

            '<div class="gap-item"><div><strong>' + esc(g.skill) + '</strong>' +

            '<span class="sub">Needed for: ' + esc(g.roles.join(", ")) + '</span></div>' +

            '<span class="priority ' + (g.roles.length > 1 ? "high" : "normal") + '">' +

            (g.roles.length > 1 ? "HIGH PRIORITY" : "RECOMMENDED") + '</span></div>').join("")

        : '<p class="empty">Great! No major skill gaps found for your top roles.</p>';



    /* Training */

    const seen = {};

    const trainings = [];

    gaps.forEach(g => {

        const t = TRAINING[g.skill] || { title: titleCase(g.skill) + " Essentials", mode: "Online", note: "Build practical skills in " + g.skill + "." };

        if (!seen[t.title]) { seen[t.title] = true; trainings.push(Object.assign({ skill: g.skill }, t)); }

    });

    $("#trainingList").innerHTML = trainings.length

        ? trainings.map(t =>

            '<div class="training"><h3>' + esc(t.title) + '</h3><p>' + esc(t.note) + '</p>' +

            '<div class="pill-row"><span class="pill">' + esc(t.mode) + '</span>' +

            '<span class="pill outline">For: ' + esc(t.skill) + '</span></div></div>').join("")

        : '<p class="empty">No training needed right now. Keep learning!</p>';



    renderResumeUpgrade(results, gaps);

}



function stat(value, label) {

    return '<div class="stat"><div class="val">' + esc(value) + '</div><div class="lbl">' + esc(label) + '</div></div>';

}



function pills(label, list, outline) {

    if (!list.length) return "";

    return '<div class="pill-row"><span class="small-label">' + label + ':</span>' +

        list.map(s => '<span class="pill' + (outline ? " outline" : "") + '">' + esc(s) + '</span>').join("") + '</div>';

}



/* ---------- Resume upgrade ---------- */



function renderResumeUpgrade(results, gaps) {

    const s = state.skills;

    const total = s.certs.length + s.tools.length + s.techniques.length;



    const checks = [

        { ok: !!state.resume, text: "Resume uploaded", tip: "Upload your latest resume (PDF or DOCX)." },

        { ok: !!state.links.linkedin, text: "LinkedIn profile linked", tip: "Add your LinkedIn URL in your profile." },

        { ok: !!(state.links.github || state.links.portfolio), text: "GitHub or portfolio linked", tip: "Add a GitHub or portfolio link to show your projects." },

        { ok: total >= 5, text: "At least 5 skills listed", tip: "List more tools and techniques you know." },

        { ok: s.certs.length > 0, text: "Certificates added", tip: "Add completed certificate programmes or online courses." },

        { ok: s.tools.length > 0 && s.techniques.length > 0, text: "Tools and techniques both covered", tip: "Include both tools (e.g. Python) and techniques (e.g. NGS analysis)." },

        { ok: state.goals.list.length > 0 && state.preferredJobs.length > 0, text: "Career goal and preferred role defined", tip: "Define your career goals and preferred roles." }

    ];



    const passed = checks.filter(c => c.ok).length;

    $("#resumeScore").textContent = Math.round(passed / checks.length * 100) + "%";

    $("#resumeFileName").textContent = state.resume ? "Current resume: " + state.resume.name : "No resume uploaded";



    $("#resumeChecklist").innerHTML = checks.map(c =>

        '<li class="' + (c.ok ? "ok" : "") + '">' + (c.ok ? "✓ " : "○ ") + esc(c.text) + '</li>').join("");



    const tips = checks.filter(c => !c.ok).map(c => "<li>" + esc(c.tip) + "</li>");

    if (results[0] && gaps.length) {

        tips.push("<li>For <strong>" + esc(results[0].role.title) + "</strong>, mention these keywords once you learn them: " +

            esc(results[0].missing.slice(0, 4).join(", ") || "none") + ".</li>");

    }

    $("#resumeTips").innerHTML = tips.length

        ? "<strong>Suggestions to improve your resume</strong><ul>" + tips.join("") + "</ul>"

        : "<strong>Your resume checklist is complete. Great job!</strong>";

}



function initResumeUpgrade() {

    $("#resumeUpgradeInput").addEventListener("change", e => {

        const file = e.target.files[0];

        if (!file) return;

        const msg = $("#resumeUpgradeMsg");

        const err = checkResumeFile(file);

        if (err) { msg.textContent = "⚠ " + err; e.target.value = ""; return; }

        state.resume = { name: file.name, size: file.size, date: new Date().toISOString() };

        saveState();

        msg.textContent = "Resume updated: " + file.name;

        renderDashboard();

    });

}



/* =====================================================

   UPGRADE (payment will be added here next)

===================================================== */



function openUpgrade(plan) {

    // TODO: open payment modal / gateway for the selected plan

    alert("The " + plan + " plan is coming soon. Payment will be added in the next step.");

}



/* =====================================================

   INIT

===================================================== */



document.addEventListener("DOMContentLoaded", function () {

    initTagFields();

    initWizard();

    initResumeUpgrade();



    $("#editProfileBtn").addEventListener("click", showWizard);



    // dashboard nav active highlight

    $$("#dashNav a.nav-item").forEach(link => {

        link.addEventListener("click", () => {

            $$("#dashNav .nav-item").forEach(i => i.classList.remove("active"));

            link.classList.add("active");

        });

    });



    fillForms();



    if (state.completed) {

        showDashboard();

        $('#dashNav a[href="#secOverview"]').classList.add("active");

    } else {

        // resume at first unsaved step

        let first = 1;

        while (first <= TOTAL_STEPS && state.savedSteps.includes(first)) first++;

        showStep(Math.min(first, TOTAL_STEPS));

    }

});