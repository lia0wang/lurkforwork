import { apiCall, show, hide, handleLogin, getUsernameById } from "./helpers.js";
import { registerValidator, emailValidator, passwordValidator, nameValidator, getValuesInForm, showErrorPopup } from "./auth.js";
import { populateFeed, populateItems } from "./feed.js";

document.getElementById("error-popup-close").addEventListener("click", () => {
    hide("error-popup");
});

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
    apiCall("auth/login", "POST", payload).then((data) => {
        handleLogin(data);
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
    apiCall("auth/register", "POST", payload).then((data) => {
        handleLogin(data);
    });
});

document.getElementById("nav-logout").addEventListener("click", () => {
    show("section-logged-out");
    hide("section-logged-in");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    show("nav-register");
    show("nav-login");
    hide("nav-logout");
    hide("nav-profile");
    hide("nav-feed");
    hide("page-profile");
    show("page-feed");
});

document.getElementById("nav-profile").addEventListener("click", async () => {
    show("page-profile");
    hide("page-feed");
    show("nav-feed");
    hide("nav-profile");

    const payload = {
        userId: localStorage.getItem("userId"),
    };

    const data = await apiCall("user", "GET", payload);

    const userAvatar = document.getElementById("user-avatar");
    userAvatar.style.backgroundImage = `url(${data.image})`;

    const userId = document.getElementById("user-id");
    userId.textContent = `#${data.id}`;

    const userName = document.getElementById("user-name");
    userName.textContent = `${data.name}`;

    const userEmail = document.getElementById("user-email");
    userEmail.textContent = `${data.email}`;

    // Add Bootstrap classes to the elements
    userAvatar.classList.add("avatar");
    userId.classList.add("user-info__text");
    userName.classList.add("user-info__text");
    userEmail.classList.add("user-info__text");

    // Jobs
    const jobs = data.jobs;
    const containerId = "user-jobs";
    populateItems(jobs, containerId);

    // Watchees
    const watchees = data.watcheeUserIds;
    const numWatchees = watchees.length;

    const numWatcheesElement = document.getElementById("watchees-num");
    numWatcheesElement.textContent = numWatchees;
    numWatcheesElement.style.fontWeight = "bold";

    const watcheesContainer = document.getElementById("user-watchees");
    watcheesContainer.textContent = "";
    for (const watcheeId of watchees) {
        const payload = {
            userId: watcheeId,
        };
        const watcheeInfo = await apiCall("user", "GET", payload);
        const watcheeName = await getUsernameById(watcheeId);

        const watcheeElement = document.createElement("div");
        watcheeElement.classList.add("card", "mb-3");
        watcheeElement.style.maxWidth = "200px";
        watcheeElement.style.maxHeight = "100px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "p-3");

        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title", "mb-1");
        cardTitle.textContent = watcheeName;

        const cardSubtitle = document.createElement("h6");
        cardSubtitle.classList.add("card-subtitle", "text-muted", "mb-3");
        cardSubtitle.textContent = watcheeInfo.email;

        const avatarContainer = document.createElement("div");

        const avatar = document.createElement("div");
        avatar.style.backgroundImage = `url(${watcheeInfo.image})`;

        avatarContainer.appendChild(avatar);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        cardBody.appendChild(avatarContainer);
        watcheeElement.appendChild(cardBody);
        watcheesContainer.appendChild(watcheeElement);
    }
});

document.getElementById("edit-profile-button").addEventListener("click", async () => {
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    
    const email = prompt("Enter your new email:");
    if (!emailValidator(email)) {
        showErrorPopup("Email format should be: example@domain.com");
        return false;
    }
    userEmail.textContent = `${email}`;

    const password = prompt("Enter your new password:");
    if (!passwordValidator(password)) {
        showErrorPopup("Password should be at least 8 characters long and contain at least one uppercase letter and one number");
        return false;
    }

    const name = prompt("Enter your new name:");
    if (!nameValidator(name)) {
        showErrorPopup("Name should be between 2 and 30 characters");
        return false;
    }
    userName.textContent = `${name}`;

    const image = prompt("Enter your new image URL:");
    userAvatar.style.backgroundImage = `url(${image})`;

    const payload = {
        email: email,
        password: password,
        name: name,
        image: image,
    };

    await apiCall("user", "PUT", payload);
});

document.getElementById("nav-feed").addEventListener("click", () => {
    show("page-feed");
    hide("page-profile");
    show("nav-profile");
    hide("nav-feed");
});

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    hide("section-logged-out");
    hide("nav-register");
    hide("nav-login");
    show("section-logged-in");
    show("nav-logout");
    show("nav-profile");
    populateFeed();
}
