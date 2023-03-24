import { populateItems } from "./feed.js";
import { apiCall, getUsernameById, hide, show } from "./helpers.js";

export const populateUserInfo = async (userId) => {
    const payload = {
        userId: userId,
    };

    const data = await apiCall("user", "GET", payload);

    // Watch Button Logic
    const cachedUserID = localStorage.getItem("userId");
    console.log("Cached user ID:", cachedUserID);
    console.log("Current User ID:", userId);
    
    const watchButton = document.getElementById("watch-button");

    if (userId == cachedUserID) {
        console.log("Hiding watch button");
        watchButton.textContent = "BJKdkajsdkasl";
        hide("watch-button-container");
    } else {
        for (const watchee of data.watcheeUserIds) {
            console.log("Watchee:", watchee);
            if (watchee == cachedUserID) {
                console.log("User is already being watched");
                watchButton.textContent = "unwatch";
                show("watch-button-container");
                return data;
            }
        }
        console.log("User is not being watched");
        watchButton.textContent = "watch";
        show("watch-button-container");
    }
    
    const userAvatarElement = document.getElementById("user-avatar");
    userAvatarElement.style.backgroundImage = `url(${data.image})`;

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
    
    return data;
};

export const populateWatchees = async (data) => {
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
        
        const cardButton = document.createElement("button");
        cardButton.classList.add("btn", "btn-secondary", "btn-sm");
        cardButton.textContent = "Profile";
        cardButton.setAttribute("id", "watchee-card-button");
        cardButton.setAttribute("value", `${watcheeId}`);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        watcheeElement.appendChild(cardButton);
        watcheeElement.appendChild(cardBody);
        watcheesContainer.appendChild(watcheeElement);

        cardButton.addEventListener("click", async () => {
            // Populate the profile page with the watchee's info
            const data = await populateUserInfo(watcheeId);
            populateItems(data.jobs, "user-jobs");
            populateWatchees(data);
        });
    }
};