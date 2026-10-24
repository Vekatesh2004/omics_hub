const signupForm = document.getElementById("signupForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const terms = document.getElementById("terms");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const strengthBar =
    document.getElementById("strengthBar");

const strengthText =
    document.getElementById("strengthText");

const createBtn =
    document.getElementById("createBtn");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");


// ============================
// SHOW / HIDE PASSWORD
// ============================

togglePassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        password.type = "password";
        togglePassword.textContent = "Show";

    }

});


toggleConfirmPassword.addEventListener("click", function () {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";
        toggleConfirmPassword.textContent = "Hide";

    } else {

        confirmPassword.type = "password";
        toggleConfirmPassword.textContent = "Show";

    }

});


// ============================
// PASSWORD STRENGTH
// ============================

password.addEventListener("input", function () {

    const value = password.value;

    let strength = 0;

    if (value.length >= 8) {
        strength++;
    }

    if (/[A-Z]/.test(value)) {
        strength++;
    }

    if (/[0-9]/.test(value)) {
        strength++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        strength++;
    }


    if (value.length === 0) {

        strengthBar.style.width = "0%";
        strengthText.textContent = "Password strength";

    }

    else if (strength <= 1) {

        strengthBar.style.width = "25%";
        strengthText.textContent = "Weak";

    }

    else if (strength === 2) {

        strengthBar.style.width = "50%";
        strengthText.textContent = "Fair";

    }

    else if (strength === 3) {

        strengthBar.style.width = "75%";
        strengthText.textContent = "Good";

    }

    else {

        strengthBar.style.width = "100%";
        strengthText.textContent = "Strong";

    }

});


// ============================
// FORM SUBMISSION
// ============================

signupForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Clear previous errors

    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("confirmPasswordError").textContent = "";
    document.getElementById("termsError").textContent = "";


    let valid = true;


    // NAME VALIDATION

    if (fullName.value.trim() === "") {

        document.getElementById("nameError").textContent =
            "Please enter your full name.";

        valid = false;

    }


    // EMAIL VALIDATION

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {

        document.getElementById("emailError").textContent =
            "Please enter your email address.";

        valid = false;

    }

    else if (!emailPattern.test(email.value)) {

        document.getElementById("emailError").textContent =
            "Please enter a valid email address.";

        valid = false;

    }


    // PASSWORD VALIDATION

    if (password.value.length < 8) {

        document.getElementById("passwordError").textContent =
            "Password must contain at least 8 characters.";

        valid = false;

    }


    // CONFIRM PASSWORD

    if (confirmPassword.value === "") {

        document.getElementById("confirmPasswordError").textContent =
            "Please confirm your password.";

        valid = false;

    }

    else if (password.value !== confirmPassword.value) {

        document.getElementById("confirmPasswordError").textContent =
            "Passwords do not match.";

        valid = false;

    }


    // TERMS

    if (!terms.checked) {

        document.getElementById("termsError").textContent =
            "Please accept the Terms and Privacy Policy.";

        valid = false;

    }


    // STOP IF INVALID

    if (!valid) {
        return;
    }


    // DEMO LOADING STATE

    createBtn.disabled = true;

    buttonText.textContent = "Creating Account...";
    loader.style.display = "inline-block";


    /*
       BACKEND API WILL GO HERE.

       Example later:

       fetch("/api/register", {
           method: "POST",
           headers: {
               "Content-Type": "application/json"
           },
           body: JSON.stringify({
               name: fullName.value,
               email: email.value,
               password: password.value
           })
       });
    */


    setTimeout(function () {

        alert(
            "Account form submitted successfully!"
        );

        createBtn.disabled = false;

        buttonText.textContent =
            "Create Account";

        loader.style.display = "none";

    }, 1500);

});