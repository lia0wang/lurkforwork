import { handleLoginUI } from "./helpers.js";
import { populateFeed } from "./jobs.js";
import "./dropZone.js";

//////////////////////////////////////////////////////// Main //////////////////////////////////////////////////////////

if (localStorage.getItem("token")) {
    handleLoginUI();
    populateFeed();
}