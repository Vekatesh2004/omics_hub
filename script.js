/* =========================================
   GET HTML ELEMENTS
========================================= */

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const emailError = document.getElementById("emailError");

const passwordError = document.getElementById("passwordError");

const showPassword =
    document.getElementById("showPassword");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");

const status =
    document.getElementById("status");



/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

showPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";

        showPassword.textContent = "🙈";

    }

    else {

        password.type = "password";

        showPassword.textContent = "👁";

    }

});



/* =========================================
   EMAIL VALIDATION
========================================= */

function validateEmail(emailAddress) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(emailAddress);

}



/* =========================================
   CLEAR ERRORS
========================================= */

function clearErrors() {

    emailError.textContent = "";

    passwordError.textContent = "";

    status.textContent = "";

}



/* =========================================
   LOGIN FORM
========================================= */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    clearErrors();


    const emailValue =
        email.value.trim();

    const passwordValue =
        password.value;


    let valid = true;



    /* Email validation */

    if (emailValue === "") {

        emailError.textContent =
            "Please enter your email address.";

        valid = false;

    }

    else if (!validateEmail(emailValue)) {

        emailError.textContent =
            "Please enter a valid email address.";

        valid = false;

    }



    /* Password validation */

    if (passwordValue === "") {

        passwordError.textContent =
            "Please enter your password.";

        valid = false;

    }



    /* Stop if invalid */

    if (!valid) {

        return;

    }



    /* =====================================
       LOADING STATE
    ===================================== */

    loginButton.classList.add("loading");


    /*
       TEMPORARY FRONT-END DEMO

       Later your backend team will replace
       this section with the login API.
    */

    setTimeout(function () {

        loginButton.classList.remove("loading");


        status.textContent =
            "Login form is ready for backend integration.";

        status.style.color = "#23734A";


        console.log("Login information:");

        console.log("Email:", emailValue);

        console.log(
            "Remember me:",
            document.getElementById("remember").checked
        );


    }, 1500);

});



/* =========================================
   FORGOT PASSWORD
========================================= */

const forgotPassword =
    document.querySelector(
        ".login-options a"
    );


forgotPassword.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        alert(
            "Forgot password page will be connected here."
        );

    }
);



/* =========================================
   CREATE ACCOUNT
========================================= */

const createAccount =
    document.querySelector(
        ".create-account a"
    );


createAccount.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        /*
           Open the Create Account page
        */

        window.location.href = "signup.html";

    }
);



/* =========================================
   GOOGLE LOGIN
========================================= */

const googleButton =
    document.querySelector(
        ".google-button"
    );


googleButton.addEventListener(
    "click",
    function () {

        alert(
            "Google authentication will be connected later."
        );

    }
);