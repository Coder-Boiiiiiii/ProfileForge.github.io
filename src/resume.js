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
        // Try your API first
        let response = await fetch(`https://bold-wasp-97.deno.dev/?username=${encodeURIComponent(username)}`);
        
        // If your API fails, fall back to GitHub's API
        if (!response.ok) {
            console.log("Falling back to GitHub API");
            response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
            const userData = await response.json();
            const reposResponse = await fetch(userData.repos_url);
            const reposData = await reposResponse.json();
            return { userData, reposData };
        }
        
        return await response.json();
    } catch (error) {
        console.error("Both APIs failed:", error);
        throw error;
    }
}

async function updateProfileCard(data) {
    showLoading(); 

    try{
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
        console.log(reposData);

        // Display repository cards
        await renderRepoCards(reposData);

        // Generate language chart
        generateChart(reposData); 
        
        // Language mastery levels
        CalculateMasteryStats(reposData);

        // Badges
        const badges = getBadges(userData, reposData);
        renderBadges(badges);
    }

    finally{
        hideLoading();
    }    
}

function formatGitDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric"
    }).format(date);
}

//Individual repo score
function getRepoScore(repo){
    let repoScore = 0.5;

    // score based on stars (weighted)
    const safeStars = repo.stargazers_count + 1; //to avoid log10(0)
    const weighted_starScore = Math.log10(safeStars) * 0.2; 
    repoScore += Math.min(weighted_starScore, 0.5);

    // score based on last update (weighted)
    const daysSinceUpdate = (new Date() - new Date(repo.updated_at)) / (86400000);

    repoScore += (Math.max(0, 1 - (daysSinceUpdate / 720)) * 0.2);

    // score based on size
    const sizeMB = repo.size/1024;
    if (sizeMB > 10) repoScore += 0.4;
    else if (sizeMB > 5) repoScore += 0.2;
    else if (sizeMB > 1) repoScore += 0.1;

    return repoScore;
}

// Get repo score out of 10
// Lenient since not every repo has to be big to be good.
function NormalizeRepoScore(score){
    const MIN_SCORE = 0.1;
    const MAX_SCORE = 1.2;

    const clamped = Math.min(Math.max(score, MIN_SCORE), MAX_SCORE);
    const scaled = ((clamped - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 10;
    const margin = scaled + 0.5; //Leniency

    return Math.min(Math.round(margin * 10) / 10, 10);
}

// Calculate mastery levels
function CalculateMasteryStats(repoData){
    const repoStats = [];
    const repoScores = [];

    repoData.forEach(repo => {
        if(repo.language){
            repoStats.push(
                {
                    language: repo.language,
                    stargazers_count: repo.stargazers_count,
                    updated_at: repo.updated_at,
                    size: repo.size
                }
            )
        }
    });

    repoStats.forEach(repo => {
        repoScores.push(
            {
                language: repo.language,
                score: getRepoScore(repo)
            }
        )
    });

    const aggregatedScores  = repoScores.reduce((acc, { language, score }) => {
        acc[language] = (acc[language] || 0) + score;
        return acc;
        }, {});

    const languageStats = Object.entries(aggregatedScores).map(([language, score]) => {
        let level;
        if (score >= 5) level = "Professional";
        else if (score >= 2) level = "Proficient";
        else level = "Novice";

        return { language, score, level };
    });

    // Optional: Sort by score (highest first)
    languageStats.sort((a, b) => b.score - a.score);

    console.log(languageStats);
    console.log(repoStats);
    renderMasteryStats(languageStats);
}

function renderMasteryStats(langStats){
    const container = document.getElementById('mastery-levels');

    if(!container) return;

    const level_code = 
    `
        <div class = "mb-3 text-white">
            <span style = "color: {{COLOR}}"><strong>{{LANGUAGE}}:</strong></span> {{LEVEL}} ({{SCORE}})
        </div>
    `

    container.innerHTML = langStats.map(stat => level_code
        .replace('{{LANGUAGE}}', stat.language)
        .replace('{{LEVEL}}', stat.level)
        .replace('{{SCORE}}', Math.round(stat.score))
        .replace('{{COLOR}}', getColor(stat.language))
    ).join('');
}

async function renderRepoCards(repos) {
    const container = document.getElementById('repo-cards');
    const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);

    if (!container) return;

    // Reset opacity before rendering new cards
    container.classList.remove('loading-fade');

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
                            <p class="text-white" id="smaller-stats">Score: {{SCORE}}/10</p>
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
        .replace('{{PROGRESS}}', repo.languagesBar)
        .replace('{{SCORE}}', NormalizeRepoScore(getRepoScore(repo)))
    ).join(''); // Use the pre-fetched languagesBar
}

function renderBadges(badges){
    const container = document.getElementById('badges');

    if(!container) return;

    const card_code = 
    `
        <div class="col-12 col-sm-6 col-md-4 d-flex justify-content-center">
        <div class="badge p-3 d-flex flex-column justify-content-center align-items-center text-white" 
            style="width: 200px; height: 200px;">
                <div class="mb-2" style = "font-size: 80px">{{ICON}}</div>
                <p class="mb-3" style = "font-size: 15px"><strong>{{TEXT}}</strong></p>
                <p class="mb-1 badge-caption" style = "font-size: 12px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    padding: 0 8px;"><strong>{{INFO}}</strong></p>
             </div>
        </div>
    `

    container.innerHTML = badges.map(badges => card_code
        .replace('{{ICON}}', badges.icon)
        .replace('{{TEXT}}', badges.text)
        .replace('{{INFO}}', badges.info)
    ).join('');
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

// Repo loading
function showLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.classList.remove('d-none');
    document.getElementById('repo-cards').classList.add('loading-fade');
  }
}

function hideLoading() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.classList.add('d-none');
    document.getElementById('repo-cards').classList.remove('loading-fade');
  }
}