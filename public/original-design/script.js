
/* =========================================================
   OMICSHUB PROFESSIONAL
   FRONTEND INTERACTION
========================================================= */


/* =========================================================
   GLOBAL HELPERS
========================================================= */

function showScreen(screenId) {

    const screens = [
        "uploadScreen",
        "processingScreen",
        "extractedScreen",
        "consentScreen",
        "planScreen",
        "registrationScreen",
        "paymentScreen",
        "successScreen",
        "dashboardScreen"
    ];

    screens.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.remove("hidden");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showToast(title, message) {

    const toast = document.getElementById("toast");

    document.getElementById("toastTitle").textContent = title;

    document.getElementById("toastMessage").textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   FILE UPLOAD
========================================================= */

const resumeInput = document.getElementById("resumeInput");

if (resumeInput) {

    resumeInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        const extension = file.name.split(".").pop().toLowerCase();

        if (!["pdf", "doc", "docx"].includes(extension)) {

            showToast(
                "Invalid file",
                "Please select a PDF, DOC or DOCX resume."
            );

            this.value = "";

            return;
        }


        document.getElementById("fileName").textContent = file.name;

        const sizeKB = Math.round(file.size / 1024);

        document.getElementById("fileSize").textContent =
            sizeKB + " KB";


        document
            .getElementById("selectedFile")
            .classList.remove("hidden");


        const analyzeBtn = document.getElementById("analyzeBtn");

        analyzeBtn.disabled = false;

        analyzeBtn.classList.remove("disabled");


        showToast(
            "Resume selected",
            "Your resume is ready for analysis."
        );

    });

}


function removeFile() {

    resumeInput.value = "";

    document
        .getElementById("selectedFile")
        .classList.add("hidden");

    const analyzeBtn = document.getElementById("analyzeBtn");

    analyzeBtn.disabled = true;

    analyzeBtn.classList.add("disabled");

}


function startAnalysis() {

    if (!resumeInput.files.length) {

        showToast(
            "Upload required",
            "Please choose your resume first."
        );

        return;
    }


    showScreen("processingScreen");


    const items = [
        "process1",
        "process2",
        "process3",
        "process4",
        "process5",
        "process6"
    ];


    let current = 0;

    let progress = 0;


    const interval = setInterval(() => {

        progress += 4;

        document.getElementById("processingProgress").style.width =
            progress + "%";

        document.getElementById("processingPercent").textContent =
            progress + "%";


        if (progress % 16 === 0 && current < items.length) {

            document
                .getElementById(items[current])
                .classList.add("active");

            current++;

        }


        if (progress >= 100) {

            clearInterval(interval);

            items.forEach(id => {

                document
                    .getElementById(id)
                    .classList.add("active");

            });


            setTimeout(() => {

                showScreen("extractedScreen");

                showToast(
                    "Analysis complete",
                    "Your resume information has been extracted."
                );

            }, 600);

        }

    }, 100);

}



/* =========================================================
   CONSENT
========================================================= */

function goToConsent() {

    showScreen("consentScreen");

}


function continueFromConsent() {

    const info =
        document.getElementById("consentInfo").checked;

    const terms =
        document.getElementById("consentTerms").checked;

    const processing =
        document.getElementById("consentProcessing").checked;


    if (!info || !terms || !processing) {

        showToast(
            "Consent required",
            "Please confirm all three consent items."
        );

        return;
    }


    showScreen("planScreen");

}


/* =========================================================
   PLAN
========================================================= */

function selectProfessional() {

    showScreen("registrationScreen");

    showToast(
        "Professional selected",
        "Complete registration to continue."
    );

}


/* =========================================================
   REGISTRATION
========================================================= */

function continueRegistration() {

    const name =
        document.getElementById("regName").value.trim();

    const email =
        document.getElementById("regEmail").value.trim();

    const phone =
        document.getElementById("regPhone").value.trim();

    const password =
        document.getElementById("regPassword").value;

    const confirmPassword =
        document.getElementById("regConfirmPassword").value;


    if (!name || !email || !phone || !password || !confirmPassword) {

        showToast(
            "Incomplete registration",
            "Please fill in all required fields."
        );

        return;
    }


    if (!email.includes("@")) {

        showToast(
            "Invalid email",
            "Please enter a valid email address."
        );

        return;
    }


    if (password.length < 6) {

        showToast(
            "Password too short",
            "Password should contain at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        showToast(
            "Passwords do not match",
            "Please check your password confirmation."
        );

        return;
    }


    showScreen("paymentScreen");

}


/* =========================================================
   PAYMENT
========================================================= */

function selectPayment(button) {

    document
        .querySelectorAll(".payment-option")
        .forEach(option => {

            option.classList.remove("active");

        });


    button.classList.add("active");

}


function completePayment() {

    const payButton =
        document.querySelector(".order-card .primary-btn");


    payButton.innerHTML =
        "Processing payment...";


    payButton.style.opacity = "0.7";

    payButton.disabled = true;


    setTimeout(() => {

        const registrationId =
            "OMX-PRO-" +
            new Date().getFullYear() +
            "-" +
            Math.floor(10000 + Math.random() * 89999);


        document.getElementById("registrationId")
            .textContent = registrationId;


        payButton.innerHTML =
            'Pay ₹1,499 <span>→</span>';

        payButton.style.opacity = "1";

        payButton.disabled = false;


        showScreen("successScreen");


    }, 1800);

}


/* =========================================================
   DASHBOARD
========================================================= */

function openDashboard() {

    showScreen("dashboardScreen");

    switchSection("dashboard");

    showToast(
        "Welcome to OmicsHub",
        "Your Professional dashboard is now active."
    );

}


function switchSection(sectionName) {

    if (
        document.getElementById("dashboardScreen")
            .classList.contains("hidden")
    ) {

        showScreen("dashboardScreen");

    }


    document
        .querySelectorAll(".dashboard-section")
        .forEach(section => {

            section.classList.remove("active-section");

        });


    const target =
        document.getElementById(
            "section-" + sectionName
        );


    if (target) {

        target.classList.add("active-section");

    }


    document
        .querySelectorAll(".side-link")
        .forEach(link => {

            link.classList.remove("active");

            if (
                link.dataset.section === sectionName
            ) {

                link.classList.add("active");

            }

        });


    const currentName =
        document.querySelector(
            `.side-link[data-section="${sectionName}"]`
        );


    document.getElementById(
        "breadcrumbCurrent"
    ).textContent =
        currentName
            ? currentName.textContent.trim()
            : "Dashboard";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    closeNotificationPanel();

}


/* =========================================================
   SIDEBAR EVENTS
========================================================= */

document
    .querySelectorAll(".side-link")
    .forEach(link => {

        link.addEventListener("click", function () {

            const section =
                this.dataset.section;

            switchSection(section);

        });

    });


function toggleSidebar() {

    document
        .getElementById("sidebar")
        .classList.toggle("open");

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function openNotificationPanel() {

    document
        .getElementById("notificationPanel")
        .classList.add("open");

}


function closeNotificationPanel() {

    document
        .getElementById("notificationPanel")
        .classList.remove("open");

}


function markNotificationsRead() {

    document
        .querySelectorAll(".unread")
        .forEach(notification => {

            notification.classList.remove("unread");

        });


    document
        .querySelectorAll(".unread-dot")
        .forEach(dot => {

            dot.remove();

        });


    const count =
        document.querySelector(".notification-count");


    if (count) {

        count.textContent = "0";

    }


    showToast(
        "Notifications updated",
        "All notifications have been marked as read."
    );

}


/* =========================================================
   EDIT MODAL
========================================================= */

function editSection(section) {

    const titles = {

        personal: "Edit Personal Information",

        education: "Edit Education",

        experience: "Edit Experience",

        skills: "Edit Skills",

        projects: "Edit Project",

        certifications: "Edit Certification"

    };


    document.getElementById(
        "editModalTitle"
    ).textContent =
        titles[section] || "Edit Details";


    document
        .getElementById("editModal")
        .classList.add("open");


}


function closeEditModal() {

    document
        .getElementById("editModal")
        .classList.remove("open");

}


function saveEdit() {

    closeEditModal();

    showToast(
        "Changes saved",
        "Your information has been updated in this demo."
    );

}



/* =========================================================
   INFO BUTTONS
========================================================= */

function showInfo(type) {

    const messages = {

        "How It Works":
            "Explore your dashboard → review skills → discover opportunities → build your career.",

        "About OmicsHub":
            "OmicsHub is a bioinformatics and life-science career development platform.",

        "Login":
            "Login functionality can be connected to the backend authentication service."

    };


    showToast(
        type,
        messages[type] || "Information available."
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    const confirmed =
        confirm(
            "Do you want to return to the OmicsHub welcome page?"
        );


    if (!confirmed) {
        return;
    }


    closeNotificationPanel();

    showScreen("dashboardScreen");
    switchSection("dashboard");

    showToast(
        "Demo mode",
        "You are viewing the OmicsHub dashboard."
    );

}


/* =========================================================
   SEARCH
========================================================= */

const searchInput =
    document.getElementById("dashboardSearch");


if (searchInput) {

    searchInput.addEventListener(
        "keypress",
        function (event) {

            if (event.key !== "Enter") {
                return;
            }


            const query =
                this.value.trim().toLowerCase();


            if (!query) {

                showToast(
                    "Search",
                    "Type something to search your workspace."
                );

                return;

            }


            const mapping = {

                skill: "skills",

                skills: "skills",

                job: "jobs",

                jobs: "jobs",

                course: "courses",

                courses: "courses",

                training: "training",

                profile: "profile",

                notification: "notifications",

                plan: "upgrade"

            };


            let found = false;


            Object.keys(mapping).forEach(keyword => {

                if (
                    query.includes(keyword)
                    && !found
                ) {

                    switchSection(
                        mapping[keyword]
                    );

                    found = true;

                }

            });


            if (!found) {

                showToast(
                    "No direct match",
                    "Try searching skills, jobs, courses, training, profile or plan."
                );

            }

        }
    );

}


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

document
    .getElementById("editModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            closeEditModal();

        }

    });


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    showScreen("dashboardScreen");
    switchSection("dashboard");

});