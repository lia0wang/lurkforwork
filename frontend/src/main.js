import { apiCall, show, hide, handleLogin, handleLoginUI, getUsernameById, handleLogout } from "./helpers.js";
import { registerValidator, emailValidator, passwordValidator, nameValidator, getValuesInForm, showErrorPopup } from "./auth.js";
import { populateFeed, populatePostCards } from "./jobs.js";
import { populateUserInfo, populateWatchees } from "./users.js";
import "./dropZone.js";

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
    handleLogout();
});

document.getElementById("nav-profile").addEventListener("click", () => {
    hide("page-feed");
    hide("nav-profile");
    hide("watch-user-button");
    show("page-profile");
    show("nav-feed");

    // User info
    const userId = localStorage.getItem("userId");
    populateUserInfo(userId)
        .then((data) => {
            // Jobs
            const jobs = data.jobs;
            const containerId = "user-jobs";
            populatePostCards(jobs, containerId);

            // Watchees
            populateWatchees(data);
        });
});

document.getElementById("edit-profile-button").addEventListener("click", () => {
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

    apiCall("user", "PUT", payload);
});

document.getElementById("nav-feed").addEventListener("click", () => {
    show("page-feed");
    hide("page-profile");
    show("nav-profile");
    show("watch-user-button");
    hide("nav-feed");
});

document.getElementById("watch-button").addEventListener("click", () => {
    const currentUserId = document.getElementById("user-id").textContent.slice(1); // #10648 -> 10648
    const turnon = (document.getElementById("watch-button").textContent === "watch") ? true : false;
    console.log(currentUserId, turnon);

    const payload = {
        id: currentUserId,
        turnon: turnon,
    };
    apiCall("user/watch", "PUT", payload);

    populateUserInfo(currentUserId)
        .then((data) => {
            // Jobs
            const jobs = data.jobs;
            const containerId = "user-jobs";
            populatePostCards(jobs, containerId);

            // Watchees
            populateWatchees(data);
        });
});

document.getElementById("watch-user-button").addEventListener("click", () => {
    const targetUserEmail = prompt("Enter the email of the user:");
    if (!emailValidator(targetUserEmail)) {
        showErrorPopup("Email format should be: example@domain.com");
        return;
    }

    const payload = {
        email: targetUserEmail,
        turnon: true,
    };
    apiCall("user/watch", "PUT", payload);
});

const displayPage = () => {
    const hash = window.location.hash;
    console.log(window.location);
    if (hash === "#page-register") {
        hide("page-login");
        show("page-register");
    } else if (hash === "#page-login") {
        hide("page-register");
        show("page-login");
    } else if (hash === "#page-profile") {
        hide("page-feed");
        show("page-profile");
        show("nav-feed");
        hide("nav-profile");
        hide("watch-user-button");
    } else if (hash === "#page-feed") {
        show("page-feed");
        hide("page-profile");
        show("nav-profile");
        show("watch-user-button");
        hide("nav-feed");
    }
};

window.addEventListener("hashchange", displayPage);
window.addEventListener("load", displayPage);

document.getElementById("nav-register").addEventListener("click", () => {
    updateUrl("#page-register");
});

const updateUrl = (url) => {
    console.log(url);
    const fragment = url.split("#")[1];
    history.pushState({}, "", `#${fragment}`);
};

// Infinite scroll
let currentPage = 0;
const itemsPerPage = 5;

window.addEventListener("scroll", () => {
    const containerId = "feed-items";
    
    // Avoid error popups showing up when switching pages
    if (!document.getElementById("page-profile").classList.contains("hide")) {
        return;
    }

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop >= scrollHeight - 5) {
        currentPage++;

        const start = currentPage * itemsPerPage;
        apiCall(`job/feed?start=${start}`, "GET", {})
            .then((data) => {
                if (data.length === 0) {
                    // showErrorPopup("No more jobs to show");
                    return;
                }
                populatePostCards(data, containerId);
            })
            .catch((error) => {
                console.error("Error fetching next page of job items:", error);
            })
    }    
});

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    handleLoginUI();
    populateFeed();
}
