import { BACKEND_PORT, POLLING_INTERVAL_TIME } from "./config.js";
import { showErrorPopup } from "./auth.js";
import { populateFeed, pollFeed } from "./jobs.js";

export let pollingInterval = null;


/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

////////////////////////////////////////////////////// TOKEN ////////////////////////////////////////////////////////

export const setToken = (token) => {
    localStorage.setItem("token", token);
    show("section-logged-in");
    hide("section-logged-out");
    populateFeed();
};

export const setUserId = (userId) => {
    localStorage.setItem("userId", userId);
};

//////////////////////////////////////////////////////// DOM HELPERS ////////////////////////////////////////////////////////

export const getUsernameById = (id) => {
    return apiCall(`user`, "GET", { userId: id })
        .then((data) => {
            return data.name;
        })
};

export const show = (element) => {
    document.getElementById(element).classList.remove("hide");
};

export const hide = (element) => {
    document.getElementById(element).classList.add("hide");
};

export const handleLogin = (data) => {
    setToken(data.token);
    setUserId(data.userId)
    handleLoginUI();
};

export const handleLoginUI = () => {
    hide("section-logged-out");
    hide("nav-register");
    hide("nav-login");
    show("nav-logout");
    show("nav-profile");
    show("nav-add-job");
    show("watch-user-button")
    show("section-logged-in");
    // Polling for new posts, likes and comments every POLLING_INTERVAL_TIME seconds
    pollingInterval = setInterval(pollFeed, POLLING_INTERVAL_TIME);
};

export const handleLogout = () => {
    document.getElementById("feed-items").textContent = "";
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    show("section-logged-out");
    hide("section-logged-in");
    show("nav-register");
    show("nav-login");
    hide("nav-logout");
    hide("watch-user-button");
    hide("nav-profile");
    hide("nav-feed");
    hide("nav-add-job");
    hide("page-profile");
    show("page-feed");
    show("watch-user-button");
    hide("watch-user-button")
    // stop polling
    clearInterval(pollingInterval);
};


//////////////////////////////////////////////////////// API CALLS ////////////////////////////////////////////////////////

export const apiCall = (path, method, body, headers = {}) => {
    // console.log("API call:", path, method, body);

    const options = {
        method: method,
        headers: {
            "Content-type": "application/json",
            ...headers, // Merge custom headers
        },
    };

    if (method === "GET" && body ) {
        // Convert body object to query string for GET requests
        const queryString = new URLSearchParams(body).toString();
        if (queryString)
            path += "?" + queryString;
    } else if (body) {
        options.body = JSON.stringify(body);
    }

    if (localStorage.getItem("token")) {
        options.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }

    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${BACKEND_PORT}/` + path, options)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    showErrorPopup(data.error);
                } else {
                    resolve(data);
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error);
                reject(error);
            });
    });
};
