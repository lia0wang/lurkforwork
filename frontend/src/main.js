import { apiCall, show, hide, setToken, setUserId, handleLogin} from "./helpers.js";
import { registerValidator, getValuesInForm} from "./auth.js";
import { populateFeed } from "./feed.js";

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
});

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

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    hide("section-logged-out");
    hide("nav-register");
    hide("nav-login");
    show("section-logged-in");
    show("nav-logout");
    populateFeed();
}
