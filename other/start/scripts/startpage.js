window.onload = function() {
    this.initSearchBar()
    this.displayDate()
    this.swapStyleSheet()
}

function swapStyleSheet() {
    var themeName = localStorage.getItem("theme")

    if(themeName != ("touhou" || "sakura"|| "vocaloid" || "default" ) || themeName === null) {
        nekoLog("Theme is null, fallback to default.theme.css.", Style.warning)
        document.getElementById('pagestyle').setAttribute('href', './styles/default.theme.css')
    } else {
        document.getElementById('pagestyle').setAttribute('href', `./styles/${themeName}.theme.css`)
        nekoLog("Setting theme to " + themeName, Style.success)
    }

}

function displayDate() {

    let currentDate = new Date();
    let cDay = currentDate.getDate();
    let cMonth = currentDate.getMonth() + 1;
    let cYear = currentDate.getFullYear();

    let finalString = cMonth + " / " + cDay + " / " + cYear
    document.getElementById('dateDisplay').innerHTML = finalString
}

function initSearchBar() {
    document.getElementById("search-bar-input").value = ""
    document.getElementById("search-bar-input").focus()

    document.getElementById("search-bar-input").addEventListener("keypress", (event) => {
        if (event.key != 'Enter') return

        ddgSearchUrl = "https://duckduckgo.com/?q="
        query = document.getElementById("search-bar-input").value.replace(/\ /g, "+")
        document.location = ddgSearchUrl + query
    })
}