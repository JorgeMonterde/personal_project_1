// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPScRz-SR8AB5ezkNTqzsaDCuPPBL-oco",
    authDomain: "referential-explore-account.firebaseapp.com",
    projectId: "referential-explore-account",
    storageBucket: "referential-explore-account.appspot.com",
    messagingSenderId: "410406980356",
    appId: "1:410406980356:web:8fec9db57124cd70249e51"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize Firestore
const db = firebase.firestore();
//Initialize Auth
const auth = firebase.auth();
const user = auth.currentUser;

// Main HTML elements
//"Explore" elements
let exploreAnchor = document.querySelector("#explore");
let exploreSection = document.querySelector(".explore_section");
let searchForm = document.querySelector("#explore_form");
let cardDisplaySection = document.querySelector(".card_display");

//"Account" elements
let accountAnchor = document.querySelector("#account");
let accountSection = document.querySelector(".account_section");
let signUpForm = document.querySelector("#account_form_signUp");
let logInForm = document.querySelector("#account_form_logIn");

// AUTH main functions:
//Log in function
logInForm.addEventListener("submit", async function (event){
    event.preventDefault();
    let email = document.getElementById("logIn_email").value;
    let password = document.getElementById("logIn_password").value;

    try {
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User authenticated')
                const user = userCredential.user;
                console.log(userCredential);
                userEmail = email;
                console.log(`Hello, ${email}`);
                //logInForm.reset();
            });
    } catch (error) {
        console.log('Invalid user or password');
    }
})

//Sign up function
signUpForm.addEventListener("submit", async function (event){
    event.preventDefault();
    let name = document.getElementById("signUp_name").value;
    let email = document.getElementById("signUp_email").value;
    let password = document.getElementById("signUp_password").value;
    let rePassword = document.getElementById("signUp_rePassword").value;

    //Validation:
    const nameRegex = /^[a-z0-9_-]{3,16}$/;
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
    const passwordRegex = /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;
    if (!nameRegex.test(name)){
        alert("Name can contain numbers, leters, '_' and '-'.");
        return;
    }
    if(!emailRegex.test(email)){
        alert("The email format is not allowed.");
        return;
    }
    if(password != rePassword){
        alert("Repeated password did not match with the first one.");
        return;
    }
    if(!passwordRegex.test(password)){
        alert("Password should contain one lowercase, one uppercase, one number and at least 8 characters.");
        return;
    }
    //Create user:
    try {
        await auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                userCredential.user.updateProfile({
                    displayName: name
                });
                console.log('User registered');
                let user = userCredential.user;
                console.log(user);
                signUpForm.reset();
            });
    } catch(error) {
        console.log(`There has been an error with code: ${error.code}: ${error.message}`)
    }
});


/* 
//Logout function
logOutButton.addEventListener('click', function (){
    auth.signOut().then(() => {
        window.location.href = "/pages/question.html"
        console.log('Logout user');
    }).catch((error) => {
      console.log('Error: ', error)
    });
})
*/








// "Explore" functions
// Get answers from "form" and Fetch

// Hide-show function:
function hideShow(element){
    element.classList.toggle("hidden");
};

// Show-hide "Account" form:
accountAnchor.addEventListener("click", function (event){
    event.preventDefault();
    hideShow(accountSection);
    if(!exploreSection.classList.contains("hidden")){
        hideShow(exploreSection);
    }
});

// Show-hide "Explore" form:
exploreAnchor.addEventListener("click", function (event){
    event.preventDefault();
    hideShow(exploreSection);
    if(!accountSection.classList.contains("hidden")){
        hideShow(accountSection);
    }
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