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
    if(totalStars >= 10000){
        badges.push(
            {
                icon: '&#9733',
                text: 'Blackstar',
                //class: 'badge-stars'
                info: "Get 10k or more total stars",
                tooltip: "Look up here, I&#39m in production - your legacy is now immortal.",
                unicorn: true
            }
        )
    }
    
    else if(totalStars >= 5000){
        badges.push(
            {
                icon: '&#128084',
                text: 'Thin White',
                //class: 'badge-stars'
                info: "Get 5k or more total stars",
                tooltip: "Station to Pull Request: You&#39re the Thin White Duke of clean merges."
            }
        )
    }
    
    else if(totalStars >= 1000){
        badges.push(
            {
                icon: '&#128142',
                text: 'Diamond Dog',
                //class: 'badge-stars'
                info: "Get 1k or more total stars",
                tooltip:"Rebel rebel, your code&#39s a diamond in the dog-eat-dog world of GitHub."
            }
        )
    }
    
    else if(totalStars >= 500){
        badges.push(
            {
                icon: '&#10024',
                text: 'Aladdin',
                //class: 'badge-stars'
                info: "Get 500 or more total stars",
                tooltip: "Code genie strikes like lightning! (Now with 500+ wishes granted.)"
            }
        )
    }
    
    else if(totalStars >= 100){
        badges.push(
            {
                icon: '&#10024',
                text: 'Star man',
                //class: 'badge-stars'
                info: "Get 100 or more total stars",
                tooltip: "You&#39re the star-man burning like a candle in this repo"
            }
        )
    }

    else if(totalStars >= 50){
        badges.push(
            {
                icon: '&#127775',
                text: 'Starman',
                //class: 'badge-stars'
                info: "Get 50 or more total stars",
                tooltip: "There&#39s a starman waiting in the repo&#8230 let the children code it!"
            }
        )
    }

    else if(totalStars >= 1){
        badges.push(
            {
                icon: '&#128640',
                text: 'Space Oddity',
                //class: 'badge-stars'
                info: "Get 1 or more total stars",
                tooltip: "Ground Control to Major Dev - your first star has landed!"
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
                info: "Has committed to a repo in the past 14 days",
                tooltip: "Your terminal is glowing like Ziggy&#39s guitar.",
                unicorn: true
            }
        )
    }

    else if(mostRecentDaysSinceUpdate <= 720){
        badges.push(
            {
                icon: '&#128123',
                text: 'Ghosted',
                //class: 'badge-streak'
                info: "Has committed to a repo in the past 2 years",
                tooltip: "Git resurrection still possible&#8230 maybe."
            }
        )
    }

    else if(mostRecentDaysSinceUpdate > 720){
        badges.push(
            {
                icon: '&#129702',
                text: 'Goner',
                //class: 'badge-streak'
                info: "Hasn't committed to a repo for more than 2 years",
                tooltip: "Even --force can&#39t save this branch."
            }
        )
    }

    // Open Source
    if (userData.public_repos >= 50) {
        badges.push({
            icon: '&#128081',
            text: 'Architect',
            //class: 'badge-oss'
            info: "Have 50 or more public repos",
            tooltip: "Warning: May contain submodule skyscrappers and monorepo magacities",
            unicorn: true
        });
    }

    else if (userData.public_repos >= 25) {
        badges.push({
            icon: '&#129351',
            text: 'Maintainer',
            //class: 'badge-oss'
            info: "Have 25 or more public repos",
            tooltip: "Your git log is better than Harry Potter"
        });
    }

    else if (userData.public_repos >= 10) {
        badges.push({
            icon: '&#129352',
            text: 'Creator',
            //class: 'badge-oss'
            info: "Have 10 or more public repos",
            tooltip: "Your IDE is the canvas, and every repo is a renaissance masterpiece"
        });
    }
    
    else if (userData.public_repos >= 5) {
        badges.push({
            icon: '&#129353',
            text: 'Hobbyist',
            //class: 'badge-oss'
            info: "Have 5 or more public repos",
            tooltip: "One day, even you'll git push your magnum opus"
        });
    }

    else{
        badges.push({
            icon: '&#128036',
            text: 'Noob',
            //class: 'badge-oss'
            info: "Have less than 5 public repos",
            tooltip: "This will be the start of something epic."
        });
    }

    //Popular Repo

    if(reposData.some(repo => repo.stargazers_count > 100000)){
        badges.push({
            icon: '&#129412',
            text: 'Unicorn',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 100k",
            tooltip: "The GitHub S tier - rarer than a MLP convention in Wall Street",
            unicorn: true
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 10000)){
        badges.push({
            icon: '&#127942',
            text: 'Legend',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 10k",
            tooltip: "Like the Matrix, everyone uses your code yet nobody understands it"
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 1000)){
        badges.push({
            icon: '&#129464',
            text: 'Code Hero',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 1k",
            tooltip: "Your issues tab is the Avengers HQ of bug reports (probably)"
        });
    }

    else if(reposData.some(repo => repo.stargazers_count > 100)){
        badges.push({
            icon: '&#10024',
            text: 'Stellar',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 100",
            tooltip: "Shining brighter than Neo-Tokyo in Akria"
        });
    }
    
    else if(reposData.some(repo => repo.stargazers_count > 50)){
        badges.push({
            icon: '&#127775',
            text: 'Rising Star',
            //class: 'badge-pop'
            info: "Have a repo with a stargazer count above 50",
            tooltip: "Like Stranger Things - small but mighty, and growing fast"
        });
    }

    else{
        badges.push({
            icon: '&#127756',
            text: 'Little Nebula',
            //class: 'badge-pop'
            info: "No repos above 50 stars, but we'll get there",
            tooltip: "Your repo is the Baby Yoda of GitHub - small, but full of potential."
        });
    }

    console.log(badges);
    return badges;
}

window.getBadges = getBadges;