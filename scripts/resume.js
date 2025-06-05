// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    const URL_params = new URLSearchParams(window.location.search);
    const username = URL_params.get('username');

    if (username) {
        fetchProfile(username).then(updateProfileCard);
    } else {
        // Redirect back if no username
        window.location.href = "index.html";
    }
});

async function fetchProfile(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos`)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error("Data not found");
        }
        
        const userData = await userResponse.json();
        const reposData = await reposResponse.json();
        
        return { userData, reposData };
    }
    catch(error) {
        console.error("Fetch Error: ", error);
        return null;
    }
}

function updateProfileCard(data) {
    if (!data) {
        document.getElementById("profile-name").textContent = "User not found";
        return;
    }

    const { userData, reposData } = data;

    // Profile avatar
    const profileImage = document.getElementById("profile-image");
    if (profileImage) {
        profileImage.src = userData.avatar_url;
        profileImage.alt = `${userData.login}'s avatar`;
    }

    // Profile name
    const profileName = document.getElementById("profile-name");
    if (profileName) {
        profileName.textContent = userData.name || userData.login;
    }

    // Update other profile fields with null checks
    const updateField = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    updateField("profile-following", userData.following);
    updateField("profile-followers", userData.followers);
    updateField("profile-repos", userData.public_repos);

    // Profile date
    const profileDate = document.getElementById("profile-joined");
    if (profileDate) {
        const date = new Date(userData.created_at);
        const dateFormatter = new Intl.DateTimeFormat("en-US", {
            month: "short",
            year: "numeric"
        });
        profileDate.textContent = dateFormatter.format(date);
    }

    // Calculate total stars
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    updateField("profile-stars", totalStars);

    // Debug logs
    console.log("Loaded profile:", userData);
    console.log("Total stars:", totalStars);
    console.log("Loaded repos:", reposData);
}