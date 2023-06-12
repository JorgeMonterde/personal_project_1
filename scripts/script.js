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


// General information
let currentPage = window.location.href;

// Main HTML elements
let everyShowHideSection = document.querySelectorAll(".absolute");
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
let logOutButton = document.querySelector("#log_out_button");
let newProjectSection = document.querySelector(".new_project_section");

//"Detail card" elements
//let addToProjectForm = document.getElementById("add_to_project_form");



// AUTHENTIFICATION main functions:
//Log in function
if(logInForm){
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
}


//Sign up function
if (signUpForm){
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
        
        try {
            // Create user:
            await auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    userCredential.user.updateProfile({
                        displayName: name
                    });
                    console.log('User registered');
                    console.log(userCredential.user);
                    let userUid = userCredential.user.uid;
                    signUpForm.reset();
                    console.log(userUid)
                    // Create user DB document:
                    addNewDocument("users", userUid);
                });
        } catch(error) {
            console.log(`There has been an error with code: ${error.code}: ${error.message}`)
        }
    });
}

//Log Out function
function logOut(){
    auth.signOut().then(() => {
        document.location.href = "/pages/main.html";
        console.log('Logout user');
    }).catch((error) => {
      console.log('Error: ', error)
    });
}

//Observe the user's state
auth.onAuthStateChanged(user => {
    if(user){
        console.log('Logged user');
        accountAnchorMenuLogged();
        let userName = auth.currentUser.displayName;
        console.log(auth.currentUser.uid)
    }else{
        console.log('No logged user');
    }
})

// Changes when logged in:
function accountAnchorMenuLogged(){
    let loggedMenu = `<a href="main.html">MAIN</a><a href="projects.html">MY PROJECTS</a><a href="">PROFILE</a><input type="button" id="log_out_button" onclick="logOut()" value="LOG OUT">`;
    accountSection.innerHTML += loggedMenu;

    hideShow(document.querySelector("#account_form_signUp"));
    hideShow(document.querySelector("#account_form_logIn"));

}

// ADDING INFO TO DB main functions:
// Add a new user in "users" collection:
async function addNewDocument(collection, doc){
    await db.collection(collection).doc(doc).set({
        collection: [],
        projects: {}
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });
};
// Update field:
async function updateField(collection, doc, field, value){
    console.log(field)
    await db.collection(collection).doc(doc).update({
        [field]: value
    })
    .then(() => {
        console.log("Document successfully updated!");
    })
    .catch((error) => {
        console.error("Error: ", error);
    })
}
// Read document info:
// pepe's uid: "OwW3Bod4reec5cHYLXncsTeyvFi1"
async function readDocumentInfo(collection, doc){
    return await db.collection(collection).doc(doc).get().then(querySnapshot => {
        console.log(querySnapshot.data())
        return querySnapshot.data();
    });
}










// Hide-show function:
function hideShow(element){
    if (element){
        element.classList.toggle("hidden");
    } else {
        console.log(typeof element)
    }
};

// "Show-hide" forms (position:absolute) function:
function hideShowAbsolute(triggerElement, elementToShow){
    if (triggerElement){
        triggerElement.addEventListener("click", function (event){
            event.preventDefault();
            let isHidden = elementToShow.classList.toggle("hidden");
            everyShowHideSection.forEach(item => item.classList.add("hidden"));

            if(!isHidden){
                elementToShow.classList.remove("hidden");
            } else {
                elementToShow.classList.add("hidden");
            }
        });
        document.addEventListener("mousedown", function(event){
            if(!elementToShow.contains(event.target)){
                elementToShow.classList.add("hidden")
            }
        })
    } else {
        console.log("'triggerElement' dont exists")
    }
}

hideShowAbsolute(exploreAnchor, exploreSection);
hideShowAbsolute(accountAnchor, accountSection);


/* 
// Show-hide "Account" form:
if(accountAnchor){
    accountAnchor.addEventListener("click", function (event){
        event.preventDefault();
        hideShow(accountSection);
        if(!exploreSection.classList.contains("hidden")){
            hideShow(exploreSection);
        }
    });
}
 */
/* 
// Show-hide "Explore" form:
if (exploreAnchor){
    exploreAnchor.addEventListener("click", function (event){
        event.preventDefault();
        hideShow(exploreSection);
        if(!accountSection.classList.contains("hidden")){
            hideShow(accountSection);
        }
    });
    document.addEventListener("mousedown", function(event){
        if(!exploreSection.contains(event.target)){
            exploreSection.classList.add("hidden")
        }
    })
} */



// "Explore" functions
// Get answers from "form" and Fetch

// Search button function:
if(searchForm){
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
}

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

// Manage artwork Info and create detailed card:
async function detailedCardformat(fullCardInfo){
    let {title, artist_display, date_display, id, goodImage} = fullCardInfo;
    let detailedCard = `<article class="detailedCard">
                            <div class="dc_basic_info">
                                <h2>${title}</h2>
                                <img src="${goodImage}" alt="">
                                <p>${artist_display}</p>
                                <p>${date_display}</p>
                            </div>
                            <div class="dc_buttons">
                                <button id="" onclick="closeDetailedCard()">Close card</button>
                                <form id="add_to_project_form">
                                    <select id="select_project" name="selectProject">
                                    </select>
                                    <input type="submit" id="add_to_project_input">
                                </form>
                            </div>
                        </article>`;
    // Add select options according to the user's projects
    await selectProjectOptions(); 
    document.querySelector(".detailed_card_display").innerHTML += detailedCard;
    // Add to project event listener:
    let addToProjectForm = document.getElementById("add_to_project_form");
    addToProjectForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let projectName = event.target.selectProject.value;
        await addToProject(projectName, fullCardInfo, id);
    })
}

// Detailed cards functions:
async function showFullCard(artwork_id){
    let cardDisplay = document.querySelector(".card_display");
    
    hideShow(cardDisplay);

    await artworkInfo.then(async (info) => {
        // Look for card info with id as argument:
        let detailedCardIndex = info.findIndex(item => item.id == +artwork_id);
        let detailedCardInfo = info[detailedCardIndex];
        let imgSrc = imgSrcArr[detailedCardIndex];
        detailedCardInfo.goodImage = imgSrc; // Add the image to full artwork info

        detailedCardformat(detailedCardInfo);
        
    })             
}


// Select project options:
async function selectProjectOptions(){
    await auth.onAuthStateChanged(async (user) => {
        if(user){
            let {displayName, email, uid, photoURL} = auth.currentUser;
            let fields = await readDocumentInfo("users", uid);
            let projectsNames = Object.keys(fields.projects);

            let selectTag = document.getElementById("select_project");
            projectsNames.forEach(name => {
                selectTag.innerHTML += `<option value="${name}" name="selectProject">${name}</option>`
            });
        }else{
            console.log('No logged user');
        }
    });
};

// Add artwork to project:
async function addToProject(projectName, artworkCard, artworkId){
    await auth.onAuthStateChanged(async (user) => {
        if(user){
            let {displayName, email, uid, photoURL} = auth.currentUser;
            let field = `projects.${projectName}.${artworkId}`;
            await updateField("users", uid, field, artworkCard)
        }else{
            console.log('No logged user');
        }
    });
}

function closeDetailedCard(){
    let detCard = document.querySelector(".detailedCard");
    detCard.remove();
    let cardDisplay = document.querySelector(".card_display");
    if(cardDisplay){
        hideShow(cardDisplay);
    }
    let myProjectsDisplay = document.querySelector(".my_projects_display");
    if(myProjectsDisplay){
        hideShow(myProjectsDisplay);
    }
    
}


// ACCOUNT functions:
//Main HTML elements:
let myProjectsArticle = document.querySelector(".my_projects");
let artworksArticle = document.querySelector(".artworks");
let artworkDisplay = document.querySelector(".artwork_display");
let projectsArtworksSection = document.querySelector(".proyects_artworks")

// Add new project:
async function createNewProject(projectName, info){
    // RegEx validation here: ...
    await auth.onAuthStateChanged(async (user) => {
        if(user){

            let {uid} = auth.currentUser;
            let field = `projects.${projectName}.info`;
            await updateField("users", uid, field, info)
        }else{
            console.log('No logged user');
        }
    });
}

// Create new project form:
function createNewProjectSection(){
    let newProjectSectionStr = `<section class="new_project_section absolute">
                                    <h3>Create new project</h3>
                                    <form id="new_project_form">
                                        <input type="text" name="projectName" id="projectName" placeholder="project name" required>
                                        <input type="text" name="description" id="description" placeholder="description">
                                        <input type="submit" id="create_proyect_submit" value="CREATE PROJECT">
                                    </form>
                                </section>`;
    projectsArtworksSection.innerHTML += newProjectSectionStr;
    // Add "hide-show" function:
    let newProjectButton = document.querySelector("#new_project_button");
    let newProjectSection = document.querySelector(".new_project_section");
    hideShowAbsolute(newProjectButton, newProjectSection);
    // Add form listener:
    let createProjectForm = document.querySelector("#new_project_form");
    createProjectForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        let projectName = event.target.projectName.value;
        let description = event.target.description.value;
        let info = {projectName, description};
        // Add project to Firestore:
        await createNewProject(projectName, info)
        hideShow(newProjectSection);
    });
}

function addNewProjectButton(){
    let button = document.createElement("button");
    button.setAttribute("id", `new_project_button`);
    button.appendChild(document.createTextNode("+"))
    button.className = "project_name";
    myProjectsArticle.appendChild(button);

    button.addEventListener("click", (event)=>{
        let allButtons = document.querySelectorAll(".project_name");
        allButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected_special");
        createNewProjectSection();
    })
}

async function getUserCardInfo(projectName, artworkId){
    await auth.onAuthStateChanged(async (user) => {
        if(user){
            let {uid} = auth.currentUser;
            let fields = await readDocumentInfo("users", uid);
            let artwork = fields.projects[projectName][artworkId];

            if(artwork){
                await showUserFullCards(artwork);
            }
        }else{
            console.log('No logged user');
        }
    });
};

// User detailed cards function: (-----> Idially, "showFullCards" and "showUserFullCard" will be the same function)
async function showUserFullCards(fullCardInfo){
    let projectsDisplay = document.querySelector(".my_projects_display");
    hideShow(projectsDisplay);
    detailedCardformat(fullCardInfo);
}

function addArtworksToList(projectName, artworksArr, container){
    if(container){
        container.innerHTML += `<div id="${projectName}" class="art_info_div hidden"></div>`;
        let pro_artworks_div = document.querySelector(`#${projectName}`);
        artworksArr.forEach((artwork, index) => {

            let {title, artist_title, date_start, goodImage, id} = artwork;
            let div = document.createElement("div");
            div.className = "artwork_info";
            div.setAttribute("id", `artDiv_${index}`);
            div.innerHTML = `<span>${title}</span><span>${artist_title}</span><span>${date_start}</span>`;
            artworkDisplay.innerHTML += `<img id="artImg_${index}" src="${goodImage}" class="ghost_images hidden">`;
            pro_artworks_div.appendChild(div);
            // Add event listeners:
            div.addEventListener("mouseover", (event) => {
                let ghostImage = document.querySelector(`#artImg_${index}`);
                hideShow(ghostImage);
            });
            div.addEventListener("mouseout", (event) => {
                let ghostImage = document.querySelector(`#artImg_${index}`);
                hideShow(ghostImage);
            })
            div.addEventListener("click", async (event) => {
                await getUserCardInfo(projectName, id)
            })
        });
        // I don't know where is this div element coming from. Remove div:
        let ghostDiv = document.querySelectorAll(".artwork_info div");
        ghostDiv.forEach(item => item.remove());
    }
}

function addProjectButton(projectName){
    let button = document.createElement("button");
    button.setAttribute("id", `button_${projectName}`);
    button.appendChild(document.createTextNode(projectName))
    button.className = "project_name";
    myProjectsArticle.appendChild(button);

    button.addEventListener("click", (event)=>{
        let allButtons = document.querySelectorAll(".project_name");
        allButtons.forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        let artworksDiv = document.getElementById(projectName);
        let otherArtworksDiv = document.querySelectorAll(".art_info_div");
        otherArtworksDiv.forEach(item => item.classList.add("hidden"));
        hideShow(artworksDiv);
    })
}

async function printProjectsAndArtworks(){
    await auth.onAuthStateChanged(async (user) => {
        if(user){
            let {displayName, email, uid, photoURL} = auth.currentUser;
            let fields = await readDocumentInfo("users", uid);
            let projectsNames = Object.keys(fields.projects);
            for(let i=0; i<projectsNames.length; i++){
                let artworks = Object.values(fields.projects[projectsNames[i]]);
                addArtworksToList(projectsNames[i], artworks, artworksArticle);
                addProjectButton(projectsNames[i]);
            }
        }else{
            console.log('No logged user');
        }
    });
};

// Print projects and artworks on "my projects":
if(currentPage.includes("/pages/projects.html")){
    printProjectsAndArtworks();
    addNewProjectButton();
}

