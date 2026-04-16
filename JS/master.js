// check of local storage is empty 
let mainColors = localStorage.getItem("color-option");

// background random options 
let backgroundOptions = true;

// variable to interval  
let theInterval;

// check if local storage has value 
let backgroundLocalItem = localStorage.getItem("options-background");

// load saved state
if (backgroundLocalItem !== null) {
    backgroundOptions = (backgroundLocalItem === "true");
}

// apply saved color
if (mainColors !== null) {
    document.documentElement.style.setProperty("--main-color", mainColors);
}


// landing page
let landingPage = document.querySelector(".landing_page");

// images array
let arrayPicture = [
    
];


// function to start random images
function randomlize() {

    clearInterval(theInterval);

    if (!backgroundOptions) return;

    theInterval = setInterval(() => {

        let randNum = Math.floor(Math.random() * arrayPicture.length);

        landingPage.style.backgroundImage = `url("${arrayPicture[randNum]}")`;

        // optional: save last image
        localStorage.setItem("last-bg", arrayPicture[randNum]);

    }, 1000);
}


// load last background on refresh
let savedBg = localStorage.getItem("last-bg");
if (savedBg !== null) {
    landingPage.style.backgroundImage = `url("${savedBg}")`;
}


// start automatically on load
randomlize();


// setting box open
let box = document.querySelector(".setting_box");
let gear = document.querySelector(".icons_settings");
let icon = document.querySelector(".icons_settings i");

gear.addEventListener("click", () => {

    box.classList.toggle("open");

    icon.classList.add("spin");

    setTimeout(() => {
        icon.classList.remove("spin");
    }, 500);
});


// change color in the web
const li = document.querySelectorAll(".list li");

li.forEach(li => {
    li.addEventListener("click", (e) => {

        let color = e.target.dataset.color;

        document.documentElement.style.setProperty("--main-color", color);

        localStorage.setItem("color-option", color);

        // remove active
        e.currentTarget.parentElement.querySelectorAll(".active")
            .forEach(ele => {
                ele.classList.remove("active");
            });

        // add active
        e.currentTarget.classList.add("active");
    });
});


// change background option yes/no
const randomBackgroundElement = document.querySelectorAll(".randback button");

randomBackgroundElement.forEach(button => {

    button.addEventListener("click", (e) => {

        // remove active
        e.currentTarget.parentElement.querySelectorAll(".active")
            .forEach(ele => {
                ele.classList.remove("active");
            });

        e.currentTarget.classList.add("active");

        if (e.currentTarget.dataset.back === "yes") {

            backgroundOptions = true;

            localStorage.setItem("options-background", "true");

            randomlize();

        } else {

            backgroundOptions = false;

            clearInterval(theInterval);

            localStorage.setItem("options-background", "false");
        }
    });
});