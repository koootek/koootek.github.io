function createElements() {
    const settingsBar = document.createElement("div");
    settingsBar.id = "settingsBar";
    const colorModeSwitch = document.createElement("img");
    colorModeSwitch.id = "colorModeSwitch";
    colorModeSwitch.src = "assets/icons/lightmode.svg";
    colorModeSwitch.alt = "switch dark/light mode";
    settingsBar.appendChild(colorModeSwitch);
    document.body.appendChild(settingsBar);
}

createElements();

function setDarkMode(darkMode) {
    colorModeSwitch.src = `assets/icons/${darkMode ? "lightmode" : "darkmode"}.svg`
    document.documentElement.className = darkMode ? "darkmode" : "";
    writeCookie("darkmode", darkMode);
}

const colorModeSwitch = document.getElementById("colorModeSwitch");
let darkModeCookie = readCookie("darkmode");
let darkMode = darkModeCookie == null ? true : (darkModeCookie === "true");

setDarkMode(darkMode);
colorModeSwitch.addEventListener("click", () => {
    darkMode = !darkMode;
    setDarkMode(darkMode);
});
