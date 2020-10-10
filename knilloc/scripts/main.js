window.onload = function() {
    this.initSearchBar()
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