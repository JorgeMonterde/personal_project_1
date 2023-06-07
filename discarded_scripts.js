// Show-hide "Account" form:
function hideShowAccount(){
    hideShow(accountSection);
    if(!exploreSection.classList.contains("hidden")){
        hideShow(exploreSection);
    }
}
// Show-hide "Explore" form:
function hideShowExplore(){
    hideShow(exploreSection);
    if(!accountSection.classList.contains("hidden")){
        hideShow(accountSection);
    }
}