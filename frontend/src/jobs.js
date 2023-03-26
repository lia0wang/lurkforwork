import { apiCall, fileToDataUrl, hide, show } from "./helpers.js";
import { showErrorPopup } from "./auth.js";
import { populateUserInfo, populateWatchees } from "./users.js";

let currentJobId = null;

export const populatePostCards = (data, containerId) => {
    if (document.getElementById("page-feed").classList.contains("hide")) {
        document.getElementById(containerId).textContent = "";
    }
    const cardPromises = data.map((item) => {
        const feedDom = document.createElement("div");
        feedDom.className = "card mb-3 feed-card";

        const row = document.createElement("div");
        row.className = "row no-gutters";
        feedDom.appendChild(row);

        const colImg = document.createElement("div");
        colImg.className = "col-md-4";
        row.appendChild(colImg);

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "card-img img-wrapper";
        colImg.appendChild(imgWrapper);
        const img = document.createElement("img");
        img.src = item.image;
        img.className = "job-image";
        imgWrapper.appendChild(img);

        const colBody = document.createElement("div");
        colBody.className = "col-md-8";
        row.appendChild(colBody);

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        colBody.appendChild(cardBody);

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = item.title;
        cardBody.appendChild(title);

        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = item.description;
        cardBody.appendChild(description);

        const extraInfo = document.createElement("div");
        extraInfo.className = "creator-time-wrapper";
        cardBody.appendChild(extraInfo);

        const creatorTextPromise = getCreatorUsername(item.creatorId)
            .then((creatorName) => {
                const creatorText = createInfoTextElement("Posted by: " + creatorName, "card-text text-muted post-creator-text");
                return creatorText;
            })

        const createTimeText = createInfoTextElement("Post time: " + formatTime(item.createdAt), "card-text text-muted");
        extraInfo.appendChild(createTimeText);
        const startingDateText = createInfoTextElement("Starting date: " + formatTime(item.start), "card-text text-muted");

        extraInfo.appendChild(startingDateText);
        const actionsRow = document.createElement("div");
        actionsRow.className = "d-flex justify-content-start align-items-center mt-2 actions-row";
        cardBody.appendChild(actionsRow);

        // like and comment buttons
        if (containerId === "feed-items") {
            // like button, badge and event listener
            const likeButton = document.createElement("button");
            likeButton.className = "btn btn-outline-primary btn-sm me-2 like-button";
            actionsRow.appendChild(likeButton);
            const likeIcon = document.createElement("i"); // font awesome icon
            likeIcon.className = "fas fa-thumbs-up";
            likeButton.appendChild(likeIcon);
            const likeText = document.createTextNode(" Likes ");
            likeButton.appendChild(likeText);
            const likeBadge = document.createElement("span");
            likeBadge.className = "badge bg-danger like-badge";
            likeBadge.textContent = item.likes.length;
            likeButton.appendChild(likeBadge);
            likeBadge.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent button click event from being triggered
                // pop up people who liked this post box
                const likedBy = item.likes.map(user => user.userName)
                popupLikeList(likedBy);
            });
            const currentUserId = localStorage.getItem("userId");
            const userHasLiked = item.likes.find(user => user.userId == currentUserId);
            toggleLikeButton(likeButton, userHasLiked);
            likeButton.addEventListener('click', () => {
                const liked = item.likes.find(user => user.userId == currentUserId);
                if (liked) {
                    apiCall(`job/like`, "PUT", { "id": item.id, "turnon": false }).then(() => {
                        // live update like count and UI
                        populateFeed();
                    })
                    .catch(() => {
                        showErrorPopup("No internet connection");
                    });
                } else {
                    apiCall(`job/like`, "PUT", { "id": item.id, "turnon": true }).then(() => {
                        // live update like count and UI
                        populateFeed();
                    })
                    .catch(() => {
                        showErrorPopup("No internet connection");
                    });
                }
            });

            // comment button, badge and event listener
            const commentButton = document.createElement("button");
            commentButton.className = "btn btn-outline-secondary btn-sm comment-button";
            actionsRow.appendChild(commentButton);
            const commentIcon = document.createElement("i");
            commentIcon.className = "fas fa-comment";
            commentButton.appendChild(commentIcon);
            const commentText = document.createTextNode(" Comments ");
            commentButton.appendChild(commentText);
            const commentBadge = document.createElement("span");
            commentBadge.className = "badge bg-secondary";
            commentBadge.textContent = item.comments.length;
            commentButton.appendChild(commentBadge);
            commentButton.addEventListener("click", () => {
                // clear comment input
                document.getElementById("comment-input").value = "";
                // pop up comments box
                popupCommentList(item.comments, item.id);
            });
        }

        // update and delete buttons
        if (containerId === "user-jobs") {
            const updateButton = document.createElement("button");
            updateButton.className = "btn btn-outline-primary btn-sm me-2 like-button";
            actionsRow.appendChild(updateButton);
            const updateText = document.createTextNode(" Edit ");
            updateButton.appendChild(updateText);
            updateButton.addEventListener("click", () => {
                currentJobId = item.id;
                showPopup("add-job-popup");
                // put the job existing info into the form for editing
                document.getElementById("add-job-popup-title").textContent = "Edit Job";
                document.getElementById("job-title").value = item.title;
                document.getElementById("job-description").value = item.description;
                document.getElementById("job-start-date").value = item.start;
                // live update the user profile page
                const currentUserId = localStorage.getItem("userId");
                populateUserInfo(currentUserId)
                    .then((newUserData) => {
                        populatePostCards(newUserData.jobs, "user-jobs");
                    });
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-outline-danger btn-sm";
            actionsRow.appendChild(deleteButton);
            const deleteText = document.createTextNode(" DELETE ");
            deleteButton.appendChild(deleteText);
            deleteButton.addEventListener("click", () => {
                apiCall(`job`, "DELETE", { "id": item.id })
                    .then(() => {
                        // live update the user profile page
                        const currentUserId = localStorage.getItem("userId");
                        return populateUserInfo(currentUserId);
                    })
                    .then((newUserData) => {
                        populatePostCards(newUserData.jobs, "user-jobs");
                    })
            });

        }

        return creatorTextPromise.then((creatorText) => {
            extraInfo.appendChild(creatorText);
            if (containerId === "feed-items") {
                creatorText.addEventListener("click", () => {
                    show("page-profile");
                    hide("page-feed");
                    show("nav-feed");
                    hide("nav-profile");
                    hide("watch-user-button");

                    populateUserInfo(item.creatorId)
                        .then((data) => {
                            populatePostCards(data.jobs, "user-jobs");
                            populateWatchees(data);
                        });
                });
            }
            document.getElementById(containerId).appendChild(feedDom);
        });
    });

    return Promise.all(cardPromises);
};

let lastFeedLengthHash = null;

export const populateFeed = () => {
    const containerId = "feed-items";
    apiCall("job/feed?start=0", "GET", {})
        .then((data) => {
            localStorage.setItem("feed", JSON.stringify(data));
            populatePostCards(data, containerId);
            lastFeedLengthHash = jsonHash(data);
        })
        .catch(() => {
            // if is offline or there's an error from the API, use cached data
            const cachedData = localStorage.getItem("feed");
            if (cachedData) {
                const containerId = "feed-items";
                const data = JSON.parse(cachedData);
                populatePostCards(data, containerId);
            } else {
                console.error("No cached data available");
            }
        });
};

// check if the server data base for /job/feed is updated by checking its hash value
// if so call populateFeed
export const pollFeed = () => {
    apiCall("job/feed?start=0", "GET", {})
        .then((data) => {
            // compare the hash value data with the last time we called populateFeed
            if (jsonHash(data) !== lastFeedLengthHash) {
                populateFeed();
            }
        })
};

// hash json data
const jsonHash = (data) => {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    if (jsonString.length === 0) {
      return hash;
    }
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

const getCreatorUsername = (id) => {
    return apiCall(`user`, "GET", { userId: id })
        .then((data) => {
            localStorage.setItem(`user_${id}`, JSON.stringify(data.name));
            return data.name;
        })
        .catch(() => { // offline
            const cachedData = localStorage.getItem(`user_${id}`);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return "Unknown";
        });
};;

const formatTime = (createAt) => {
    const now = new Date();
    const createdDate = new Date(createAt);
    const diffInMs = now - createdDate;
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
        const hours = Math.floor(diffInHours);
        const minutes = Math.floor(diffInMinutes % 60);
        return `${hours} hours ${minutes} minutes ago`;
    } else {
        const day = createdDate.getDate();
        const month = createdDate.getMonth() + 1;
        const year = createdDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};

const createInfoTextElement = (text, className) => {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = text;
    return paragraph;
};

const toggleLikeButton = (button, liked) => {
    if (liked) {
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-primary');
    } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-primary');
    }
};

const showPopup = (id) => {
    document.getElementById(id).style.display = "block";
};


const popupLikeList = (likedBy) => {
    const likeList = document.getElementById("like-list");

    likedBy.forEach(name => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.textContent = name;
        likeList.appendChild(listItem);
    });

    showPopup("like-list-popup");
};

document.getElementById("like-close-btn").addEventListener("click", () => {
    document.getElementById("like-list-popup").style.display = "none";
    // clear like list
    const likeList = document.getElementById("like-list");
    while (likeList.firstChild) {
        likeList.removeChild(likeList.firstChild);
    }
});

const popupCommentList = (comments, postId) => {
    const commentList = document.getElementById("comment-list");

    comments.forEach(comment => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        const listItemSpan = document.createElement("span");
        listItemSpan.textContent = comment.userName + ': ' + comment.comment;
        listItem.appendChild(listItemSpan);

        listItem.addEventListener("click", () => {
            show("page-profile");
            hide("page-feed");
            show("nav-feed");
            hide("nav-profile");
            hide("watch-user-button");

            document.getElementById("comment-list-popup").style.display = "none";
            // remove all comments DOM node after close
            const commentList = document.getElementById("comment-list");
            while (commentList.firstChild) {
                commentList.removeChild(commentList.firstChild);
            }

            console.log("creator clicked");
            populateUserInfo(comment.userId)
                .then((data) => {
                    populatePostCards(data.jobs, "user-jobs");
                    populateWatchees(data);
                });
        });

        commentList.appendChild(listItem);
    });


    // Remove existing event listeners (if any)
    const oldCommentButton = document.getElementById("comment-button");
    const newCommentButton = oldCommentButton.cloneNode(true);
    oldCommentButton.parentNode.replaceChild(newCommentButton, oldCommentButton);

    newCommentButton.addEventListener("click", () => {
        const inputComment = document.getElementById("comment-input").value;
        if (inputComment) {
            apiCall(`job/comment`, "POST", { "id": postId, "comment": inputComment })
                .catch(() => { // offline
                    showErrorPopup("No internet connection.");
                    return;
                });
            document.getElementById("comment-input").value = "";
        }
        // live update comment list
        apiCall('job/feed?start=0', "GET", { "id": postId }).then((data) => {
            document.getElementById("comment-list-popup").style.display = "none";
            // remove all comments DOM node after close
            const commentList = document.getElementById("comment-list");
            while (commentList.firstChild) {
                commentList.removeChild(commentList.firstChild);
            }
            const updatedComments = data.find((item) => item.id === postId).comments;
            popupCommentList(updatedComments, postId);
        });
    });

    showPopup("comment-list-popup");
};


document.getElementById("comment-close-btn").addEventListener("click", () => {
    document.getElementById("comment-list-popup").style.display = "none";
    // remove all comments DOM node after close
    const commentList = document.getElementById("comment-list");
    while (commentList.firstChild) {
        commentList.removeChild(commentList.firstChild);
    }
});

document.getElementById("nav-add-job").addEventListener("click", () => {
    currentJobId = -1;
    document.getElementById("add-job-popup-title").textContent = "Add a New Job";
    showPopup("add-job-popup");
});

document.getElementById("add-job-submit").addEventListener("click", () => {
    updateJob().then(() => {
        // live update the user profile page
        const currentUserId = localStorage.getItem("userId");
        populateUserInfo(currentUserId)
            .then((newUserData) => {
                populatePostCards(newUserData.jobs, "user-jobs");
                populateWatchees(newUserData);
            });

        // clear the input in the add-job-popup
        document.getElementById("add-job-popup").style.display = "none";
        document.getElementById("job-title").value = "";
        document.getElementById("job-start-date").value = "";
        document.getElementById("job-description").value = "";
        document.getElementById("job-image").value = "";
    });
});

document.getElementById("add-job-close-btn").addEventListener("click", () => {
    document.getElementById("add-job-popup").style.display = "none";
    document.getElementById("job-title").value = "";
    document.getElementById("job-start-date").value = "";
    document.getElementById("job-description").value = "";
    document.getElementById("job-image").value = "";
});

const updateJob = () => {
    const title = document.getElementById("job-title").value;
    const startDate = document.getElementById("job-start-date").value;
    const description = document.getElementById("job-description").value;
    const imageFile = document.getElementById("job-image").files[0];

    if (title && startDate && description && imageFile) {
        return fileToDataUrl(imageFile)
            .then((imageData) => {
                const requestBody = {
                    "title": title,
                    "image": imageData,
                    "start": startDate,
                    "description": description
                };

                let response;
                if (currentJobId === -1) { // create new job
                    return apiCall("job", "POST", requestBody).then((resp) => {
                        response = resp;
                        if (response) {
                            // Close the popup
                            document.getElementById("add-job-popup").style.display = "none";
                            populateFeed();
                        } else {
                            // Handle error
                            showErrorPopup(response.error);
                            console.log(`Error: ${response.error}`);
                        }
                    });
                } else { // update existing job
                    requestBody.id = currentJobId;
                    return apiCall("job", "PUT", requestBody).then((resp) => {
                        response = resp;
                        if (response) {
                            // Close the popup
                            document.getElementById("add-job-popup").style.display = "none";
                            populateFeed();
                        } else {
                            // Handle error
                            showErrorPopup(response.error);
                            console.log(`Error: ${response.error}`);
                        }
                    });
                }
            });
    } else {
        // Handle missing fields
        showErrorPopup("Missing fields");
        console.log("Missing fields");
    }
};
