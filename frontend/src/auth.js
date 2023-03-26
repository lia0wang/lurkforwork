////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// auth.js:                                                                                                   //
//      Contains user authentication related, authentication page UI, email and password                      //
// checking and validation                                                                                    //                                                                      //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { apiCall, show, hide, handleLogin, handleLogout } from "./helpers.js";

//////////////////////////////////////////////////////// POPUPS ////////////////////////////////////////////////////////

/**
 * Displays an error message in a popup.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
export const showErrorPopup = (message) => {
    document.getElementById("error-popup-message").textContent = `Error: ${message}`;
    show("error-popup");
};

//////////////////////////////////////////////////////// VALIDATORS ////////////////////////////////////////////////////////

/**
 * Gets the values of all input fields in a form and returns them as an array.
 * @param {string} formId - The ID of the form element to get the values from.
 * @returns {Array<string>} - An array containing the values of all input fields in the form.
 */
export const getValuesInForm = (formId) => {
    let values = [];
    const form = document.getElementById(formId);
    for (let i = 0; i < form.length - 1; i++) {
        values.push(form[i].value);
    }
    return values;
};

/**
 * Validates an email address using a regular expression.
 * @param {string} email - The email address to be validated.
 * @returns {(null|string)} - If the email address is valid, returns the email address as a string.
 */
export const emailValidator = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

/**
 * Validates a password using a regular expression.
 * @param {string} password - The password to be validated.
 * @returns {(null|string)} - If the password is valid, returns the password as a string.
 */
export const passwordValidator = (password) => {
    return String(password).match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
};

/**
 * Validates the length of a name.
 * @param {string} name - The name to be validated.
 * @returns {boolean} - Whether the name is between 2 and 30 characters long.
 */
export const nameValidator = (name) => {
    return String(name).length >= 2 && String(name).length <= 30;
};

/**
 * Validates if two passwords match
 * @param {string} password - The password to compare
 * @param {string} passwordConfirm - The password confirmation to compare
 * @returns {boolean} - True if passwords match, false otherwise
 */
const confirmValidator = (password, passwordConfirm) => {
    return password === passwordConfirm;
};

/**
 * Validates user registration information.
 * @param {string} email - User's email.
 * @param {string} name - User's name.
 * @param {string} password - User's password.
 * @param {string} passwordConfirm - Confirmation of user's password.
 * @returns {boolean} - Returns true if all fields are valid, otherwise false.
 */
export const registerValidator = (email, name, password, passwordConfirm) => {
    if (!emailValidator(email)) {
        showErrorPopup("Email format should be: example@domain.com");
        return false;
    }
    if (!nameValidator(name)) {
        showErrorPopup("Name should be between 2 and 30 characters");
        return false;
    }
    if (!passwordValidator(password)) {
        showErrorPopup("Password should be at least 8 characters long and contain at least one uppercase letter and one number");
        return false;
    }
    if (!confirmValidator(password, passwordConfirm)) {
        showErrorPopup("Passwords do not match");
        return false;
    }
    return true;
};

//////////////////////////////////////////////////////// AUTH MAIN //////////////////////////////////////////////////////////

document.getElementById("nav-register").addEventListener("click", () => {
    show("page-register");
    hide("page-login");
});

document.getElementById("nav-login").addEventListener("click", () => {
    hide("page-register");
    show("page-login");
});

document.getElementById("login-button").addEventListener("click", (event) => {
    event.preventDefault();
    const [email, password] = getValuesInForm("login-form");
    const payload = {
        email: email,
        password: password,
    };
    apiCall("auth/login", "POST", payload)
        .then((data) => {
            handleLogin(data);
        })
        .catch((error) => {
            showErrorPopup(error);
        });
});

document.getElementById("register-button").addEventListener("click", (event) => {
    event.preventDefault();
    const [email, name, password, passwordConfirm] = getValuesInForm("register-form");
    if (!registerValidator(email, name, password, passwordConfirm)) {
        return;
    }
    const payload = {
        email: email,
        password: password,
        name: name,
    };
    apiCall("auth/register", "POST", payload)
        .then((data) => {
            handleLogin(data);
        })
        .catch((error) => {
            showErrorPopup(error);
        });
});

document.getElementById("error-popup-close").addEventListener("click", () => {
    hide("error-popup");
});

document.getElementById("nav-logout").addEventListener("click", () => {
    handleLogout();
});
