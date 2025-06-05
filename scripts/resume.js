// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function() {
    const URL_params = new URLSearchParams(window.location.search);
    const username = URL_params.get('username');

    if (username) {
        // Load colors once at startup
        window.colorMap = await loadColors();
        fetchProfile(username).then(updateProfileCard);
    } else {
        window.location.href = "index.html";
    }
});

async function fetchProfile(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=stars`) // GitHub's built-in sort
        ]);
        
        const reposData = await reposResponse.json();
        const sortedRepos = [...reposData].sort((a, b) => b.stargazers_count - a.stargazers_count);
        
        return {
            userData: await userResponse.json(),
            reposData: sortedRepos // Pre-sorted
        };
    }
    catch(error) {
        console.error("Fetch Error:", error);
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

    generateChart(reposData);    
}

function formatGitDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric"
    }).format(date);
}

async function renderRepoCards(repos) {
    const container = document.getElementById('repo-cards');
    const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

    if (!container) return;

    // Process all repos asynchronously
    const reposWithLanguages = await Promise.all(sortedRepos.map(async repo => {
        const languagesBar = await getLanguages(repo.languages_url);
        return {
            ...repo,
            languagesBar
        };
    }));

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

                    <div class = "progress">
                        {{PROGRESS}}
                    </div>
                </div>
            </div>
        </div>
    `
    
    container.innerHTML = reposWithLanguages.map(repo => card_code
        .replace('{{NAME}}', repo.name)
        .replace('{{STARS}}', repo.stargazers_count)
        .replace('{{BODY}}', repo.description || 'No description')
        .replace('{{PROGRESS}}', repo.languagesBar)).join(''); // Use the pre-fetched languagesBar
}

async function getLanguages(language_url) {
    try {
        const response = await fetch(language_url);
        const languageData = await response.json();
        
        const total = Object.values(languageData).reduce((sum, val) => sum + val, 0);
        let bar_full = "";

        // If no languages data, return empty string
        if (total === 0) return "";

        for (const [language, bytes] of Object.entries(languageData)) {
            const percent = (bytes / total) * 100;
            const color = getColor(language);
            const text_color = darkenColor(color, 75);
            const tooltipText = `${language} : ${Math.round(percent)}%`

            const bar = `
                <div class="progress-bar" title = "${tooltipText}" role="progressbar"
                    style="width: ${percent}%; background-color: ${color}; color: ${text_color};"
                    aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
                    ${language}
                </div>
            `;

            bar_full += bar;
        }

        return bar_full;
    } catch (error) {
        console.error("Error fetching languages:", error);
        return ""; // Return empty string if there's an error
    }
}

function getColor(language) {
    return colorMap[language] || "#cccccc";
}

async function loadColors() {
    const url = "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml";
    
    try {
        const response = await fetch(url);
        const yamlText = await response.text();

        const colors = {};

        // Parse YAML (need a YAML parser)
        const parsed = jsyaml.load(yamlText);

        for (const [language, data] of Object.entries(parsed)) {
            if (data && typeof data === "object" && data.color) {
                colors[language] = data.color;
            }
        }

        return colors;
    } catch (e) {
        console.error("Failed to fetch colors, using fallback.", e);

        return {
            JavaScript: "#f1e05a",
            Java: "#b07219",
            Python: "#3572A5",
            HTML: "#e34c26",
            CSS: "#563d7c",
        };
    }
}

function darkenColor(hex, percent) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse r, g, b values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate darkened values
    const amount = Math.round(2.55 * percent);
    const newR = Math.max(0, r - amount);
    const newG = Math.max(0, g - amount);
    const newB = Math.max(0, b - amount);

    // Convert back to hex
    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

function generateChart(reposData) {
    const ctx = document.getElementById('pie');
    if (!ctx) return;

    // Filter out null/undefined languages
    const languageArray = reposData.map(repo => repo.language).filter(Boolean);

    // Count occurrences
    const counts = languageArray.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
    }, {});

    const total = languageArray.length;

    // Prepare labels, data, and colors in the same order
    const labels = Object.keys(counts);
    const data = labels.map(lang => ((counts[lang] / total) * 100).toFixed(2));
    const colors = labels.map(lang => getColor(lang));

    // Destroy previous chart if it exists
    if (window.pieChart) {
        window.pieChart.destroy();
    }

    // Create new chart
    window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: labels,
        datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        font: {
            family: 'Consolas'
        },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                color: '#ffffff',
                font: {
                    size: 12,
                }
                }
            },

            tooltip: {
                callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = data[context.dataIndex];
                    return `${label}: ${value}%`;
                }
                },
                bodyColor: '#ffffff',
                titleColor: '#ffffff',
                backgroundColor: '#0d1117'
            }
        }
    }
    });
}