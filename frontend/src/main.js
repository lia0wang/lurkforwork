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

const emailValidator = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const passwordValidator = (password) => {
    return String(password).match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
};

const nameValidator = (name) => {
    return String(name).length >= 2 && String(name).length <= 30;
};

const confirmValidator = (password, passwordConfirm) => {
    return password === passwordConfirm;
};

const registerValidator = (email, name, password, passwordConfirm) => {
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

const getValuesInForm = (formId) => {
    let values = [];
    const form = document.getElementById(formId);
    for (let i = 0; i < form.length - 1; i++) {
        values.push(form[i].value);
    }
    return values;
};

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
        setToken(data.token);
    });
});

// Show the error popup
const showErrorPopup = (message) => {
    document.getElementById("error-popup-message").textContent = `Error: ${message}`;
    show("error-popup");
};

// Close the error popup
document.getElementById("error-popup-close").addEventListener("click", () => {
    hide("error-popup");
});

document.getElementById("login-button").addEventListener("click", (event) => {
    event.preventDefault();
    const [email, password] = getValuesInForm("login-form");
    const payload = {
        email: email,
        password: password,
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
