import { BACKEND_PORT } from "./config.js";
import { fileToDataUrl } from "./helpers.js";

const apiCall = (path, method, body, headers = {}) => {
    console.log("API call:", path, method, body);

    const options = {
        method: method,
        headers: {
            "Content-type": "application/json",
            ...headers, // Merge custom headers
        },
    };

    if (method === "GET" && body) {
        // Convert body object to query string for GET requests
        const queryString = new URLSearchParams(body).toString();
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
                    alert(data.error);
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


const populateFeed = () => {
    apiCall("job/feed?start=0", "GET", {}).then((data) => {
        document.getElementById("feed-items").textContent = "";
        for (const feedItem of data) {
            const feedDom = document.createElement("div");
            feedDom.style.border = "1px solid #000";
            feedDom.innerText = feedItem.title;
            document.getElementById("feed-items").appendChild(feedDom);
        }
    });
};

const setToken = (token) => {
    localStorage.setItem("token", token);
    show("section-logged-in");
    hide("section-logged-out");
    populateFeed();
};

document.getElementById("create-job-fake").addEventListener("click", () => {
    const payload = {
        title: "COO for cupcake factory",
        image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        start: "2011-10-05T14:48:00.000Z",
        description:
            "Dedicated technical wizard with a passion and interest in human relationships",
    };
    apiCall("job", "POST", payload);
});

document.getElementById("register-button").addEventListener("click", (event) => {
    event.preventDefault();
    const password = document.getElementById("register-password").value;
    const passwordConfirm = document.getElementById("register-password-confirm").value;
    console.log(password, passwordConfirm);
    if (password !== passwordConfirm) {
        alert("Error: Passwords do not match");
        return;
    }
    const payload = {
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        name: document.getElementById("register-name").value,
    };
    apiCall("auth/register", "POST", payload).then((data) => {
        setToken(data.token);
    });
});

document.getElementById("login-button").addEventListener("click", (event) => {
    event.preventDefault();
    const payload = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value,
    };
    apiCall("auth/login", "POST", payload).then((data) => {
        setToken(data.token);
    });
});

const show = (element) => {
    document.getElementById(element).classList.remove("hide");
};

const hide = (element) => {
    console.log(document.getElementById(element).classList);
    // document.getElementById(element).classList.remove("display: flex");
    document.getElementById(element).classList.add("hide");
};

document.getElementById("nav-register").addEventListener("click", () => {
    show("page-register");
    hide("page-login");
});

document.getElementById("nav-login").addEventListener("click", () => {
    hide("page-register");
    show("page-login");
});

document.getElementById("logout").addEventListener("click", () => {
    show("section-logged-out");
    hide("section-logged-in");
    localStorage.removeItem("token");
});

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    show("section-logged-in");
    hide("section-logged-out");
    populateFeed();
}
