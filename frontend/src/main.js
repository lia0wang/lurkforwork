import { apiCall, show, hide, handleLogin, getUsernameById} from "./helpers.js";
import { registerValidator, getValuesInForm} from "./auth.js";
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
    // User Profile
    console.log(data);
    const userAvatar = document.getElementById("user-avatar");
    userAvatar.src = data.image;
    console.log("userAvatar.src: ", userAvatar.src);
    const userId = document.getElementById("user-id");
    userId.textContent = `ID: ${data.id}`
    const userName = document.getElementById("user-name");
    userName.textContent = `Name: ${data.name}`
    const userEmail = document.getElementById("user-email");
    userEmail.textContent = `Email: ${data.email}`
    
    // Jobs
    const jobs = data.jobs;
    const containerId = "user-jobs";
    populateItems(jobs, containerId);

    // Watchees
    const watchees = data.watcheeUserIds;
    const numWatchees = watchees.length;
    
    const numWatcheesElement = document.getElementById("watchees-num");
    numWatcheesElement.textContent = numWatchees;

    const watcheesContainer = document.getElementById("user-watchees");
    let count = 1;
    watcheesContainer.textContent = "";
    for (const watcheeId of watchees) {
        const payload = {
            userId: watcheeId,
        }
        const watcheeInfo = await apiCall(`user`, "GET", payload);
        console.log(watcheeInfo);
        const watcheeName = await getUsernameById(watcheeId);
        const watcheeElement = document.createElement("p");
        watcheeElement.textContent = `${count}: ${watcheeName}`
        watcheesContainer.appendChild(watcheeElement);
        count++;
    }
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
