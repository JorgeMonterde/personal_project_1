// "Explore" functions
// Get answers from "form" and Fetch

// Main HTML elements
let exploreSection = document.querySelector(".explore_section");
let cardDisplaySection = document.querySelector(".card_display");
let searchForm = document.querySelector("#explore_form");
let exploreAnchor = document.querySelector("#explore");
let accountAnchor = document.querySelector("#account");

// Hide-show function:
function hideShow(element){
    element.classList.toggle("hidden");
};

// Show-hide "Explore" form:
exploreAnchor.addEventListener("click", function (event){
    event.preventDefault();
    hideShow(exploreSection);
});

// Search button function:
searchForm.addEventListener("submit", function (event){
    event.preventDefault();
    hideShow(exploreSection);
    let cards = document.querySelectorAll(".card");
    if(cards){
        cards.forEach(item => item.remove())
    }
    // fetch functions:
    let wordToLookFor = event.target.title.value;
    searchArtworksOnAPI(wordToLookFor);
})

// Search and print results on cards:
let artworkInfo;
let imgSrcArr;
async function searchArtworksOnAPI(word){
    try {
        // Get results brief Info:
        let results = getSearchResults(word);
        // Get complete Info:
        artworkInfo = getCompleteArtworkInfo(results);  
        //Get images src:
        imgSrcArr = await getImagesSrc(artworkInfo, results);
        // printArtworkCards()
        printArtworkCards(artworkInfo, imgSrcArr);
    } catch (error){
        console.log(`Error: ${error}`)
    }
}

async function getSearchResults(word){
    let artworkIds = [];
    let iiifUrlConfig;
    let searchResults = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=${word}`)
        .then(res => res.json())
        .then(info => {
            info.data.forEach(item => artworkIds.push(item.id));
            iiifUrlConfig = info.config.iiif_url;
        });
    return {artworkIds, iiifUrlConfig};
};

async function getCompleteArtworkInfo(results){
    // Create endpoints: 
    let endpoint = "https://api.artic.edu/api/v1/artworks?ids=";
    await results.then(obj => {
        let {artworkIds} = obj;
        endpoint += artworkIds.toString();
    });
    let info = [];
    // Fetch:
    await fetch(endpoint).then(res => res.json())
        .then(item => {
            item.data.forEach(item => {
                info.push(item);
            })
        });
    return info;
};

async function getImagesSrc(artworkInfo, results){
    console.log(artworkInfo)
    let imageIdArr = [];
    await artworkInfo.then(info => {
        console.log(info)
        info.forEach(artwork => imageIdArr.push(artwork.image_id));
    });
    // "https://www.artic.edu/iiif/2/1adf2696-8489-499b-cad2-821d7fde4b33/full/843,/0/default.jpg"
    // Create image src:
    let iiifUrlConfig;
    await results.then(item => {
        iiifUrlConfig = item.iiifUrlConfig
    });
    for (let i in imageIdArr) {
        imageIdArr[i] = `${iiifUrlConfig}/${imageIdArr[i]}/full/843,/0/default.jpg`
    };
    return imageIdArr;
};

async function printArtworkCards(artworkInfo, imgSrcArr) {
    await artworkInfo.then(info => {
        for (let i=0; i<info.length; i++){
            // Destructure info:
            let {title, artist_display, date_display, id} = info[i];
            // Create card:
            let artworkCard = `<article class="card">
                                <h2>${title}</h2>
                                <img src="${imgSrcArr[i]}" alt="">
                                <p>${artist_display}</p>
                                <p>${date_display}</p>
                                <button id="${id}" onclick="showFullCard('${id}')">More info</button>
                            </article>`;
            cardDisplaySection.innerHTML += artworkCard;
        }
    });  
};


// Detailed cards functions:
async function showFullCard(artwork_id){
    let cardDisplay = document.querySelector(".card_display");
    hideShow(cardDisplay);

    await artworkInfo.then(info => {
        // Look for card info with id as argument:
        //let detailedCardInfo = info.find(item => item.id == +artwork_id);
        let detailedCardIndex = info.findIndex(item => item.id == +artwork_id);
        let detailedCardInfo = info[detailedCardIndex];
        let imgSrc = imgSrcArr[detailedCardIndex];
        let {title, artist_display, date_display, id} = detailedCardInfo;
        let detailedCard = `<article class="detailedCard">
                                <h2>${title}</h2>
                                <img src="${imgSrc}" alt="">
                                <p>${artist_display}</p>
                                <p>${date_display}</p>
                                <div>
                                    <button id="" onclick="closeDetailedCard()">Close card</button>
                                    <button id="" onclick="addToProject()">Add card to a project</button>
                                </div>
                            </article>`;
        document.querySelector(".detailed_card_display").innerHTML += detailedCard;
    })             
}

function closeDetailedCard(){
    let detCard = document.querySelector(".detailedCard");
    detCard.remove();
    let cardDisplay = document.querySelector(".card_display");
    hideShow(cardDisplay);
}