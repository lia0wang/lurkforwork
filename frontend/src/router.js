import { hide, show } from "./helpers.js";
import { populatePostCards } from "./jobs.js";
import { populateUserInfo, populateWatchees } from "./users.js";


const routes = {
    "": "",
    "login": "page-login",
    "register": "page-register",
    "feed": "page-feed",
};

export const locationHandler = () => {
    let path = window.location.hash.replace("#", ""); // login

    if (path === "") {
        path = "/";
    }
    const route = routes[path]; // page-login

    if (path.match(/profile=/)) {
        if (!localStorage.getItem("token")) {
            window.location.hash = "login";
            return;
        }
        const userId = path.split("=")[1];
        hide("page-feed");
        hide("nav-profile");
        hide("watch-user-button");
        show("page-profile");
        show("nav-feed");
    
        // User info
        populateUserInfo(userId)
            .then((data) => {
                // Jobs
                const jobs = data.jobs;
                const containerId = "user-jobs";
                populatePostCards(jobs, containerId);
    
                // Watchees
                populateWatchees(data);
            });
    }

    switch (route) {
        case "page-login":
            hide("page-register");
            show("page-login");
            break;
        case "page-register":
            show("page-register");
            hide("page-login");
            break;
        case "page-feed":
            if (!localStorage.getItem("token")) {
                window.location.hash = "login";
                return;
            }
            show("page-feed");
            hide("page-profile");
            show("nav-profile");
            show("watch-user-button");
            hide("nav-feed");
            break;
    }
}

window.addEventListener("hashchange", locationHandler);
window.addEventListener("load", locationHandler);
locationHandler();