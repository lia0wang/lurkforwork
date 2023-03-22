
import { apiCall } from "./helpers.js";

export const populateFeed = async () => {
    const data = await apiCall("job/feed?start=0", "GET", {});
    document.getElementById("feed-items").textContent = "";

    for (const feedItem of data) {
        const feedDom = document.createElement("div");
        feedDom.className = "card mb-3 feed-card";

        const row = document.createElement("div");
        row.className = "row no-gutters";
        feedDom.appendChild(row);

        const colImg = document.createElement("div");
        colImg.className = "col-md-4";
        row.appendChild(colImg);

        const img = document.createElement("img");
        img.src = feedItem.image;
        img.className = "card-img job-image";
        colImg.appendChild(img);

        const colBody = document.createElement("div");
        colBody.className = "col-md-8";
        row.appendChild(colBody);

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        colBody.appendChild(cardBody);

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = feedItem.title;
        cardBody.appendChild(title);

        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = feedItem.description;
        cardBody.appendChild(description);

        // creator and post time
        const creatorAndTime = document.createElement("p");
        creatorAndTime.className = "card-text creator-time-wrapper";

        const creatorText = document.createElement("small");
        creatorText.className = "text-muted creator-text";
        creatorText.textContent = "Created by: " + await getCreatorUsername(feedItem.creatorId);
        creatorAndTime.appendChild(creatorText);

        const createTimeText = document.createElement("small");
        createTimeText.className = "text-muted create-time-text";
        createTimeText.textContent = "Posted at: " + formatCreationTime(feedItem.createdAt);
        creatorAndTime.appendChild(createTimeText);

        cardBody.appendChild(creatorAndTime);

        // like and comment buttons
        const actionsRow = document.createElement("div");
        actionsRow.className = "d-flex justify-content-start align-items-center mt-2";
        cardBody.appendChild(actionsRow);

        const likeButton = document.createElement("button");
        likeButton.className = "btn btn-outline-primary btn-sm me-2 like-button";
        actionsRow.appendChild(likeButton);

        // font awesome icon
        const likeIcon = document.createElement("i");
        likeIcon.className = "fas fa-thumbs-up"; //
        likeButton.appendChild(likeIcon);

        const likeText = document.createTextNode(" Likes ");
        likeButton.appendChild(likeText);

        const likeBadge = document.createElement("span");
        likeBadge.className = "badge bg-primary";
        likeBadge.textContent = feedItem.likes.length;
        likeButton.appendChild(likeBadge);

        const current_user_id = localStorage.getItem("userId");
        const userHasLiked = feedItem.likes.includes(current_user_id);
        toggleLikeButton(likeButton, userHasLiked);
        likeButton.addEventListener('click', () => {
            const liked = feedItem.likes.includes(current_user_id);
            if (liked) {
                apiCall(`job/like`, "PUT", {"id": feedItem.id, "turnon": false});
            } else {
                apiCall(`job/like`, "PUT", {"id": feedItem.id, "turnon": true});
            }
            likeBadge.textContent = feedItem.likes.length;
            const userLiked = feedItem.likes.includes(current_user_id);
            toggleLikeButton(likeButton, userLiked);
        });

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
        commentBadge.textContent = feedItem.comments.length;
        commentButton.appendChild(commentBadge);

        document.getElementById("feed-items").appendChild(feedDom);
    }
};


const getCreatorUsername = async (id) => {
    const data = await apiCall(`user`, "GET", { userId: id });
    return data.name;
};

const formatCreationTime = (createAt) => {
    const now = new Date();
    const createdDate = new Date(createAt);
    const diffInMs = now - createdDate;
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
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


const toggleLikeButton = (button, liked) => {
    if (liked) {
      button.classList.remove('btn-outline-primary');
      button.classList.add('btn-primary');
    } else {
      button.classList.remove('btn-primary');
      button.classList.add('btn-outline-primary');
    }
};
