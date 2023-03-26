import { apiCall, show, hide } from "./helpers.js";
import { emailValidator, passwordValidator, nameValidator, showErrorPopup } from "./auth.js";
import { populateFeed, populatePostCards } from "./jobs.js";

//////////////////////////////////////////////////////// POPULATE USER PROFILE //////////////////////////////////////////////////////////

export const populateUserInfo = (userId) => {
    const payload = {
        userId: userId,
    };

    return apiCall("user", "GET", payload)
        .then((data) => {
            const cachedUserID = parseInt(localStorage.getItem("userId"));

            // User info
            const userAvatarElement = document.getElementById("user-avatar");
            userAvatarElement.style.backgroundImage = `url(${data.image})`;
            userAvatarElement.setAttribute("alt", `${data.name}'s Avatar`);

            const userIdElement = document.getElementById("user-id");
            userIdElement.textContent = `#${data.id}`;

            const userNameElement = document.getElementById("user-name");
            userNameElement.textContent = `${data.name}`;

            const userEmailElement = document.getElementById("user-email");
            userEmailElement.textContent = `${data.email}`;

            // Add Bootstrap classes to the elements
            userAvatarElement.classList.add("avatar");
            userIdElement.classList.add("user-info__text");
            userNameElement.classList.add("user-info__text");
            userEmailElement.classList.add("user-info__text");

            // Watch Button Logic
            const watchButton = document.getElementById("watch-button");

            if (userId == cachedUserID) {
                show("edit-profile-button-container");
                hide("watch-button-container");
            } else {
                // if the cachedUserId is not in the currentUser's watcheeUserIds, show "unwatch"
                watchButton.textContent = (data.watcheeUserIds.includes(cachedUserID)) ? "unwatch" : "watch";
                show("watch-button-container");
                hide("edit-profile-button-container");
            }
            return data;
        });
};

export const populateWatchees = (data) => {
    const watchees = data.watcheeUserIds;
    const numWatchees = watchees.length;

    // Watchees Number
    const numWatcheesElement = document.getElementById("watchees-num");
    numWatcheesElement.textContent = numWatchees;
    numWatcheesElement.style.fontWeight = "bold";

    const watcheesContainer = document.getElementById("user-watchees");
    watcheesContainer.textContent = "";
    for (const watcheeId of watchees) {
        const payload = {
            userId: watcheeId,
        };

        const watcheeElement = document.createElement("div");
        watcheeElement.classList.add("card", "mb-3");
        watcheeElement.style.width = "200px";
        watcheeElement.style.height = "100px";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "p-3");

        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title", "mb-1");
        cardTitle.style.marginTop = "-15px";

        const cardSubtitle = document.createElement("h6");
        cardSubtitle.classList.add("card-subtitle", "text-muted", "mb-3");
        apiCall("user", "GET", payload)
            .then((watcheeInfo) => {
                cardSubtitle.textContent = watcheeInfo.email;
                cardTitle.textContent = watcheeInfo.name;
            });
        const cardButton = document.createElement("button");
        cardButton.classList.add("btn", "btn-secondary", "btn-sm");
        cardButton.style.width = "55%";
        cardButton.style.marginLeft = "8%";
        cardButton.style.marginTop = "10px";
        cardButton.textContent = "Check Profile";
        cardButton.setAttribute("id", "watchee-card-button");
        cardButton.setAttribute("value", `${watcheeId}`);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        watcheeElement.appendChild(cardButton);
        watcheeElement.appendChild(cardBody);
        watcheesContainer.appendChild(watcheeElement);

        cardButton.addEventListener("click", () => {
            // Populate the profile page with the watchee's info
            populateUserInfo(watcheeId)
                .then((data) => {
                    document.getElementById("user-jobs").textContent = "";
                    populatePostCards(data.jobs, "user-jobs");
                    populateWatchees(data);
                });
        });
    }
};

//////////////////////////////////////////////////////// USERS MAIN //////////////////////////////////////////////////////////

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
            document.getElementById(containerId).textContent = "";
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
    userAvatar.setAttribute("alt", `${name}'s Avatar`);

    const payload = {
        email: email,
        password: password,
        name: name,
        image: image,
    };

    apiCall("user", "PUT", payload);
});

document.getElementById("watch-button").addEventListener("click", () => {
    const currentUserId = document.getElementById("user-id").textContent.slice(1); // #10648 -> 10648
    const turnon = (document.getElementById("watch-button").textContent === "watch") ? true : false;

    const payload = {
        id: currentUserId,
        turnon: turnon,
    };
    apiCall("user/watch", "PUT", payload);
    populateFeed();
    populateUserInfo(currentUserId)
        .then((data) => {
            // Jobs
            const jobs = data.jobs;
            const containerId = "user-jobs";
            document.getElementById(containerId).textContent = "";
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
