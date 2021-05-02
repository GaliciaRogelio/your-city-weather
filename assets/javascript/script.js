// global variables 
var typeYourCity = $("#search-city");
var searchBtnEl = $("#search-city-button");
var listOfPreviousSearches = $('#search-history-list');
var clearSearchesBtn = $("#clear-history");
var searchedCity = $("#current-city");
var cityTemperature = $("#current-temp");
var cityHumidity = $("#current-humidity");
var cityWindSpeed = $("#current-wind-speed");
var cityUvIndex = $("#uv-index");
var weatherContent = $("#weather-content");

// API Key 
var APIkey = "a17e1499228be1f9c294ac18b234c7d7";

// displays data 
var currentCityList = [];

// used moment to display current date 
var todaysDate = moment().format('L');
$("#current-date").text("(" + todaysDate + ")");

// search for previous history
initalizeHistory();
clearHistoryBtn();

// trigger input when hitting enter button 
$(document).on("submit", function(){
    event.preventDefault();

    // Grab value entered into search bar 
    var cityValue = typeYourCity.val().trim();

    currentConditionsRequest(cityValue)
    searchHistory(cityValue);
    typeYourCity.val(""); 
});

// trigger the search button when clicked to find city
searchBtnEl.on("click", function(event){
    event.preventDefault();

    // Grab value entered into search bar 
    var cityValue = typeYourCity.val().trim();

    currentConditionsRequest(cityValue)
    searchHistory(cityValue);    
    typeYourCity.val(""); 
});

// delete previous searches by emptying out the list array.
clearSearchesBtn.on("click", function(){
    currentCityList = [];
    // Update city list history in local storage
    listArray();
    
    $(this).addClass("hide");
});

// click on a city previously saved to display it again.
listOfPreviousSearches.on("click","li.city-btn", function(event) {
    var value = $(this).data("value");
    currentConditionsRequest(value);
    searchHistory(value); 
});

// Request Open Weather API based on user input
function currentConditionsRequest(cityValue) {
    
    // create URL with city values and key
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityValue + "&units=imperial&appid=" + APIkey;
    
    // Make AJAX call to get desired values 
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        searchedCity.text(response.name);
        searchedCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + todaysDate + ")");
        searchedCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        cityTemperature.text(response.main.temp);
        cityTemperature.append("&deg;F");
        cityHumidity.text(response.main.humidity + "%");
        cityWindSpeed.text(response.wind.speed + "MPH");

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        

        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;

        // Make AJAX Call for UV index
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){   
            cityUvIndex.text(response.value);
        });

        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + APIkey + "&lat=" + lat +  "&lon=" + lon;
        
        // Make AJAX call for 5-day forecast
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            $('#five-day-forecast').empty();
            for (var i = 1; i < response.list.length; i+=8) {

                var fiveDayString = moment(response.list[i].dt_txt).format("L");

                // variables inside the 5 day forecast cards
                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard = $("<div class='card'>");
                var forecastCardBody = $("<div class='card-body'>");
                var forecastDate = $("<h5 class='card-title'>");
                var forecastIcon = $("<img>");
                var forecastTemp = $("<p class='card-text mb-0'>");
                var forecastHumidity = $("<p class='card-text mb-0'>");
                var forecastWindSpeed = $("<p class='card-text mb-0'>");

                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);
                forecastCardBody.append(forecastWindSpeed);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(fiveDayString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
                forecastWindSpeed.text(response.list[i].wind.speed);
                forecastWindSpeed.prepend("Wind Speed: ");
                forecastWindSpeed.append("MPH");
                
            }
        });
    });
};

// Display and save the search history of cities
function searchHistory(cityValue) {
    
    // If there are characters entered into the search bar
    if (cityValue) {

        // add new searched city into the array 
        if (currentCityList.indexOf(cityValue) === -1) {
            currentCityList.push(cityValue);

            // List all cities in user history
            listArray();
            clearSearchesBtn.removeClass("hide");
            weatherContent.removeClass("hide");
        } else {
            // Remove value from array
            var removeIndex = currentCityList.indexOf(cityValue);
            currentCityList.splice(removeIndex, 1);

            // Push the value again to the array
            currentCityList.push(cityValue);

            // list the cities from most recent searched to last in history 
            listArray();
            clearSearchesBtn.removeClass("hide");
            weatherContent.removeClass("hide");
        };
    };
};

// List the array into the search history sidebar
function listArray() {
    // Empty out the elements in the sidebar
    listOfPreviousSearches.empty();
    // add the cities from the into the sidebar 
    currentCityList.forEach(function(city){
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        listOfPreviousSearches.prepend(searchHistoryItem);
    });
    // Update city list history in local storage
    localStorage.setItem("cities", JSON.stringify(currentCityList));
    
}
// Get the list of cities from local storage to update the history sidebar
function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        currentCityList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = currentCityList.length - 1;
        listArray();
        // display city list when page is refreshed 
        if (currentCityList.length !== 0) {
            currentConditionsRequest(currentCityList[lastIndex]);
            weatherContent.removeClass("hide");
        };
    };
};

// check for elements to be cleared in order to show clear history button
function clearHistoryBtn() {
    if (listOfPreviousSearches.text() !== "") {
        clearSearchesBtn.removeClass("hide");
    };
};