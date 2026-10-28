# 🧬 OmicsHub - Bioinformatics Training Portal

A secure, subscription-based web application designed for interactive bioinformatics training. The portal features role-based access tiers, dynamic module progress tracking, an interactive module drawer, attendance tracking, project submission portals, and automated PDF certificate generation upon course completion.

---

## 🚀 Key Features

* **Role-Based Subscriptions (`Free`, `Pro`, `Premium`):** Tier-gated access restricting higher-level bioinformatics modules based on the active user subscription plan.
* **Interactive Module Progression:** Step-by-step module viewer allowing users to learn sequentially and mark module steps complete in real time.
* **Automated PDF Certificates:** Dynamic certificate generation built with ReportLab, issuing downloadable PDF certificates with verification IDs once a course reaches 100% completion.
* **Progress & Metrics Dashboard:** Real-time visual tracking for active courses, completed modules, overall progress, and attendance eligibility.
* **Project Submission Portal:** Assignment tracking interface for practical bioinformatics uploads.
* **Authentication & Session Management:** Password hashing via Werkzeug with automatic session protection and route validation guards.

---

## 🛠️ Tech Stack

* **Language:** Python 3.x
* **Web Framework:** Flask
* **Database & ORM:** SQLite, Flask-SQLAlchemy
* **PDF Engine:** ReportLab
* **Frontend:** HTML5, Modern CSS (Flexbox & CSS Grid with dark theme styling), Vanilla JavaScript

---

## 📂 Project Structure

```text
training_portal/
│
├── app.py                      # Core Flask application, DB models, APIs & routes
├── static/
│   └── style.css               # Dark theme UI, left sidebar navigation & modal styles
├── templates/
│   ├── auth.html               # Login & Registration authentication interface
│   └── training.html           # Training Portal Dashboard & Module Drawer Modal
├── instance/
│   └── omics_hub.db            # SQLite Database (Auto-generated on launch)
├── .gitignore                  # Git exclusion rules
├── requirements.txt            # Python package dependencies
└── README.md                   # Project documentation