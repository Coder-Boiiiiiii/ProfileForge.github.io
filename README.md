# Profile Forge
A web app that analyzes GitHub profiles, visualizing repository statistics, language mastery, and contribution patterns with GitHub-inspired styling.

## ✨ Current Features

- **Profile Overview**
  - Avatar, name, join date
  - Follower/following counts
  - Total stars and repositories

- **Repository Analysis**
  - Top 6 most-starred repos
  - Repo scores (out of 10) for each repo (in top 6) based on size, star count, and last update.
  - Language distribution pie chart
  - Progress bars for language usage

- **Skill Assessment**
  - Language mastery levels (Novice/Proficient/Professional)
  - Scores based on stars, activity, and repo size
 
- **Badges**
  - Badges based on last commit, total star count, repo star count, etc.
  - Similar concept to github trophies.

- **GitHub Integration**
  - Deno proxy for API calls
  - Real-time data fetching
  - GitHub Linguist color mapping

## 🔮 Planned Features

- **PDF Export**
  - Export profile into a pleasant format.
 
- **Badges**
  - Trophy list similar to [github-profile-trophy](https://github-profile-trophy.vercel.app/)
  - Need to add more badges!

## 🛠️ Tech Stack

**Frontend**  
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

**Backend/Proxy**  
[![Deno](https://img.shields.io/badge/Deno-000000?style=flat&logo=deno&logoColor=white)](https://deno.land/)
[![GitHub API](https://img.shields.io/badge/GitHub_API-181717?style=flat&logo=github&logoColor=white)](https://docs.github.com/en/rest)
