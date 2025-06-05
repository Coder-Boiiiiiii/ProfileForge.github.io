// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
    const URL_params = new URLSearchParams(window.location.search);
    const username = URL_params.get('username');

    if (username) {
        fetchProfile(username).then(updateProfileCard);
    } else {
        window.location.href = "index.html";
    }
});

async function fetchProfile(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) throw new Error("Data not found");
        
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

    // Update profile info
    const updateField = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    // Basic profile info
    if (document.getElementById("profile-image")) {
        document.getElementById("profile-image").src = userData.avatar_url;
    }
    updateField("profile-name", userData.name || userData.login);
    updateField("profile-following", userData.following);
    updateField("profile-followers", userData.followers);
    updateField("profile-repos", userData.public_repos);
    updateField("profile-joined", formatGitDate(userData.created_at));
    
    // Calculate and display total stars
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    updateField("profile-stars", totalStars);

    // Display repository cards
    renderRepoCards(reposData);
}

function formatGitDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric"
    }).format(date);
}

function renderRepoCards(repos) {
    const container = document.getElementById('repo-cards');
    const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);

    if (!container) return;

    const card_code =
    `
        <div class="col-md-6 mb-4">
            <div class="card repo-card h-100" id = "card-base">
                <div class="card-body" id = "card_body">
                    <div class = "row">
                        <div class = "col-md-9">
                            <h5 class="text-emphasis text-white"><strong>{{NAME}}</strong></h5>
                        </div>
                        
                        <div class = "col-md-3" id="smaller-stats">
                            <h6 class="text-emphasis text-end text-white"><strong">{{STARS}}</strong> &#11088</h6>
                        </div>

                        <p class = "text-white">{{BODY}}</p>
                    </div>
                </div>
            </div>
        </div>
    `

    container.innerHTML = sortedRepos.map(repo => card_code
                        .replace('{{NAME}}', repo.name)
                        .replace('{{STARS}}', repo.stargazers_count)
                        .replace('{{BODY}}', repo.description)).join('');
}