window.onload = function() {

    var themeName = localStorage.getItem("theme")
    console.log(themeName)

}

function setTheme(themeName) {
    console.log(`Set theme to ${themeName}`);
    localStorage.setItem('theme', themeName)
}