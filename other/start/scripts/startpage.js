window.onload = function() {
    this.initSearchBar()
    this.displayDate()
    this.swapStyleSheet()
}

function swapStyleSheet() {
    var themeName = localStorage.getItem("theme")

    switch(themeName) {
        case "anime":
            document.getElementById('pagestyle').setAttribute('href', './styles/anime.theme.css')
            nekoLog("Setting theme to " + themeName, Style.success)
            break;
        case "sakura":
            document.getElementById('pagestyle').setAttribute('href', './styles/sakura.theme.css')
            nekoLog("Setting theme to " + themeName, Style.success)
            break;
        case "touhou":
            document.getElementById('pagestyle').setAttribute('href', './styles/touhou.theme.css')
            nekoLog("Setting theme to " + themeName, Style.success)
            break;
        case "default":
            document.getElementById('pagestyle').setAttribute('href', './styles/default.theme.css')
            nekoLog("Setting theme to default", Style.success)
            break;
        default:
            document.getElementById('pagestyle').setAttribute('href', './styles/anime.theme.css')
            nekoLog("themeName is null, fallback to default.theme.css.", Style.warning)
            break;
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

        ddgSearchUrl = "https://bing.com/?q="
        query = document.getElementById("search-bar-input").value.replace(/\ /g, "+")
        document.location = ddgSearchUrl + query
    })
}
