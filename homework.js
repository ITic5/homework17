/**
 * Znam da nismo imali domaci, ali sam ipak zeleo da primenim ono
 * sto si nam rekao da istrazimo. Nije "wow", ali sam eto ukombinovao
 * dva API-a :D
 */

let gamesApiUrl = "https://www.cheapshark.com/api/1.0/deals?title=";
let exchangeApiUrl = "https://api.frankfurter.dev/v1/latest";

let sortSelector = document.getElementById("sort-by");
let currentSortBy = "Rating";
let currencySelector = document.getElementById('currency-selector');
let searchButton = document.getElementById('search-button');
let gamesWrapper = document.getElementById('games-wrapper');

let currencyList = {
    USD: "US Dollar",
    RSD: "Serbain Dinar",
    GBP: "Great Britain Pound",
    CHF: "Swiss Franc",
    CNY: "Chinese Renminbi Yuan",
    HUF: "Hungarian Forint",
    TRY: "Turkish Lira"
}

let exchangeRates = {};
let currentCurrency = "EUR"

async function fetchExchangeRates() {
    let response = await fetch(exchangeApiUrl);
    let data = await response.json();
    exchangeRates = data.rates;
}

async function searchGame(name, sortBy){
    let url = gamesApiUrl + name + "&sortBy=" + sortBy;
    let response = await fetch(url);
    return await response.json();
}

for (let currency in currencyList) {
    let currencyOption = document.createElement("option");
    currencyOption.innerText = currencyList[currency];
    currencyOption.value = currency;
    currencySelector.append(currencyOption);
}

function createGameBlock(game){

    let gameBlock = document.createElement("div");
    gameBlock.setAttribute("id", "game-block");

    let gameTitle = document.createElement("h3");
    gameTitle.innerText = game.title;

    let gameRating = document.createElement("h4");
    gameRating.innerText = "Rating: " + game.steamRatingPercent + " (" + game.steamRatingCount + ")";

    let nameAndRating = document.createElement("div");
    nameAndRating.append(gameTitle, gameRating);

    let gamePoster = document.createElement("img");
    gamePoster.src = game.thumb;

    let gamePrice = document.createElement("div");
    gamePrice.setAttribute("class", "game-price");

    let gameNormalPrice = document.createElement("h5");
    gameNormalPrice.innerText = game.normalPrice + " " + currentCurrency.toLowerCase();
    gameNormalPrice.setAttribute("data-price", game.normalPrice);

    let gameSalePrice = document.createElement("h2");
    gameSalePrice.innerText = game.salePrice + " " + currentCurrency.toLowerCase();
    gameSalePrice.setAttribute("data-price", game.salePrice);

    gamePrice.append(gameNormalPrice, gameSalePrice);

    gameBlock.append(nameAndRating, gamePoster, gamePrice);

    gamesWrapper.append(gameBlock);
}

sortSelector.addEventListener("change", function () {
    currentSortBy = sortSelector.value;
})

searchButton.addEventListener("click", async function () {

    gamesWrapper.innerHTML = "";

    let gameName = document.getElementById("game-name").value;

    let response = await searchGame(gameName, currentSortBy);

    for (let game of response) {
        createGameBlock(game);
        console.log(game);
    }

});


currencySelector.addEventListener("change", async function () {
    currentCurrency = currencySelector.value;

    let games = document.getElementsByClassName("game-price");

    for (let game of games) {
        let normalPriceElem = game.querySelector("h5");
        let salePriceElem = game.querySelector("h2");

        let originalNormalPrice = normalPriceElem.getAttribute("data-price");
        let originalSalePrice = salePriceElem.getAttribute("data-price");

        if (currentCurrency === "EUR") {
            normalPriceElem.innerText = originalNormalPrice + " eur";
            salePriceElem.innerText = originalSalePrice + " eur";
        } else if (currentCurrency === "RSD") {
            normalPriceElem.innerText = Math.round(originalNormalPrice * 117.5) + " RSD";
            salePriceElem.innerText = Math.round(originalSalePrice * 117.5) + " RSD";
        }
        else {
            let convertedNormalPrice = (originalNormalPrice * exchangeRates[currentCurrency]).toFixed(2);
            let convertedSalePrice = (originalSalePrice * exchangeRates[currentCurrency]).toFixed(2);

            normalPriceElem.innerText = convertedNormalPrice + " " + currentCurrency;
            salePriceElem.innerText = convertedSalePrice + " " + currentCurrency;
        }
    }
});

fetchExchangeRates();