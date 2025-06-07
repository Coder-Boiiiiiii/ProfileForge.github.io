//Badges
function getBadges(userData, reposData){    
    const badges = [];
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const sortedRepos = [...reposData].sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
    );
    const mostRecentRepo = sortedRepos[0];
    const mostRecentDaysSinceUpdate = Math.floor((new Date() - new Date(mostRecentRepo.updated_at)) / (86400000));
    const readMeCount = reposData.filter(repo => repo.has_wiki || repo.description).length;

    //Stars
    if(totalStars >= 100){
        badges.push(
            {
                icon: '&#127775',
                text: 'Star Man',
                //class: 'badge-stars'
                info: "Get 100 or more total stars"
            }
        )
    }

    else if(totalStars >= 50){
        badges.push(
            {
                icon: '&#10024',
                text: 'Star Child',
                //class: 'badge-stars'
                info: "Get 50 or more total stars"
            }
        )
    }

    //Active
    if(mostRecentDaysSinceUpdate <= 14){
        badges.push(
            {
                icon: '&#128293',
                text: 'Active',
                //class: 'badge-streak'
                info: "Has committed to a repo in the past 14 days"
            }
        )
    }

    else if(mostRecentDaysSinceUpdate <= 720){
        badges.push(
            {
                icon: '&#128123',
                text: 'Ghosted',
                //class: 'badge-streak'
                info: "Has committed to a repo in the past 2 years"
            }
        )
    }

    else if(mostRecentDaysSinceUpdate > 720){
        badges.push(
            {
                icon: '&#129702',
                text: 'Goner',
                //class: 'badge-streak'
                info: "Hasn't committed to a repo for more than 2 years"
            }
        )
    }

    // Open Source
    if (userData.public_repos >= 50) {
        badges.push({
            icon: '&#128081',
            text: 'Architect',
            //class: 'badge-oss'
            info: "Have 50 or more public repos"
        });
    }

    else if (userData.public_repos >= 25) {
        badges.push({
            icon: '&#129351',
            text: 'Maintainer',
            //class: 'badge-oss'
            info: "Have 25 or more public repos"
        });
    }

    else if (userData.public_repos >= 10) {
        badges.push({
            icon: '&#129352',
            text: 'Creator',
            //class: 'badge-oss'
            info: "Have 10 or more public repos"
        });
    }
    
    else if (userData.public_repos >= 5) {
        badges.push({
            icon: '&#129353',
            text: 'Hobbyist',
            //class: 'badge-oss'
            info: "Have 5 or more public repos"
        });
    }

    else{
        badges.push({
            icon: '&#128036',
            text: 'Nood',
            //class: 'badge-oss'
            info: "Have less than 5 public repos"
        });
    }

    //Popular Repo

    if(reposData.some(repo => repo.stargazers_count > 100000)){
        badges.push({
            icon: '&#129412',
            text: 'Unicorn',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 100k"
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 10000)){
        badges.push({
            icon: '&#127942',
            text: 'Legend',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 10k"
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 1000)){
        badges.push({
            icon: '&#129464',
            text: 'Code Hero',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 1k"
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 100)){
        badges.push({
            icon: '&#10024',
            text: 'Stellar',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 100"
        });
    }
    
    else if(reposData.some(repo => repo.stargazers_count > 50)){
        badges.push({
            icon: '&#127775',
            text: 'Rising Star',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 50"
        });
    }

    else{
        badges.push({
            icon: '&#127756',
            text: 'Little Nebula',
            //class: 'badge-pop'
            info: "No repos above 50 stars, but we'll get there"
        });
    }

    console.log(badges);
    return badges;
}

window.getBadges = getBadges;