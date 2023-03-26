import { show, hide, handleLoginUI } from "./helpers.js";
import { populateFeed } from "./jobs.js";
import "./dropZone.js";

// Fragment
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
// let currentPage = 0;
// const itemsPerPage = 5;

// window.addEventListener("scroll", () => {
//     const containerId = "feed-items";

//     // Avoid error popups showing up when switching pages
//     if (!document.getElementById("page-profile").classList.contains("hide")) {
//         return;
//     }

//     const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
//     if (clientHeight + scrollTop >= scrollHeight - 5) {
//         currentPage++;

//         const start = currentPage * itemsPerPage;
//         apiCall(`job/feed?start=${start}`, "GET", {})
//             .then((data) => {
//                 if (data.length === 0) {
//                     // showErrorPopup("No more jobs to show");
//                     return;
//                 }
//                 populatePostCards(data, containerId);
//             })
//             .catch((error) => {
//                 console.error("Error fetching next page of job items:", error);
//             })
//     }
// });

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    handleLoginUI();
    populateFeed();
}
