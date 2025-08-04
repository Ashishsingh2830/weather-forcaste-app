// Updated app.js with loading, error handling, unit toggle fix
let celsiusTemperature = null;
let feelsLikeTemperature = null;
let windSpeed = null;

let loading = document.querySelector("#loading");
let weatherDetails = document.querySelector("#weather-details");
let fahrenheitLink = document.querySelector("#fahrenheit-link");
let celsiusLink = document.querySelector("#celsius-link");

function formatDate(timestamp) {
  let date = new Date(timestamp);
  let day = date.toLocaleString("en-US", { weekday: "long" });
  let time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let month = date.toLocaleString("en-US", { month: "long" });
  return `${day} ${time} | ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function displayForecast(response) {
  let forecast = response.data.daily;
  let forecastElement = document.querySelector("#forecast");

  let forecastHTML = `<div class="row">`;
  forecast.forEach(function (forecastDay, index) {
    if (index < 6) {
      forecastHTML += `
        <div class="col-2">
          <div class="weather-forecast-date">${formatDay(forecastDay.time)}</div>
          <img src="${forecastDay.condition.icon_url}" alt="" width="48" />
          <div class="weather-forecast-temperatures">
            <span class="weather-forecast-temperature-max">${Math.round(forecastDay.temperature.maximum)}&deg; |</span>
            <span class="weather-forecast-temperature-min">${Math.round(forecastDay.temperature.minimum)}&deg;</span>
          </div>
        </div>
      `;
    }
  });
  forecastHTML += `</div>`;
  forecastElement.innerHTML = forecastHTML;
}

function getForecast(coordinates) {
  let apiKey = "1c0f6e49a911db65307b85186bd4t6oe";
  let apiUrl = `https://api.shecodes.io/weather/v1/forecast?lon=${coordinates.longitude}&lat=${coordinates.latitude}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast);
}

function displayTemperature(response) {
  document.querySelector("#city").innerHTML = response.data.city;
  document.querySelector("#current-temperature").innerHTML = Math.round(response.data.temperature.current);
  document.querySelector("#description").innerHTML = response.data.condition.description;
  document.querySelector("#humidity").innerHTML = Math.round(response.data.temperature.humidity);
  document.querySelector("#wind").innerHTML = `${Math.round(response.data.wind.speed)} km/h`;
  document.querySelector("#feels-like").innerHTML = Math.round(response.data.temperature.feels_like);
  document.querySelector("#current-date").innerHTML = formatDate(response.data.time * 1000);
  document.querySelector("#icon").src = response.data.condition.icon_url;
  document.querySelector("#icon").alt = response.data.condition.description;

  celsiusTemperature = response.data.temperature.current;
  feelsLikeTemperature = response.data.temperature.feels_like;
  windSpeed = response.data.wind.speed;

  getForecast(response.data.coordinates);
  loading.style.display = "none";
  weatherDetails.classList.remove("d-none");
}

function showError() {
  loading.innerHTML = "City not found. Please try again.";
  weatherDetails.classList.add("d-none");
}

function search(city) {
  loading.style.display = "block";
  loading.innerHTML = "Loading...";
  weatherDetails.classList.add("d-none");
  let apiKey = "1c0f6e49a911db65307b85186bd4t6oe";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayTemperature).catch(showError);
}

function handleSubmit(event) {
  event.preventDefault();
  let city = document.querySelector("#form-input").value;
  search(city);
}

function displayFahrenheitTemperature(event) {
  event.preventDefault();
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let temperatureElement = document.querySelector("#current-temperature");
  let fahrenheitTemp = (celsiusTemperature * 9) / 5 + 32;
  temperatureElement.innerHTML = Math.round(fahrenheitTemp);
  document.querySelector("#feels-like").innerHTML = Math.round((feelsLikeTemperature * 9) / 5 + 32);
  document.querySelector("#wind").innerHTML = `${Math.round(windSpeed / 1.609)} mph`;
}

function displayCelsiusTemperature(event) {
  event.preventDefault();
  fahrenheitLink.classList.remove("active");
  celsiusLink.classList.add("active");
  document.querySelector("#current-temperature").innerHTML = Math.round(celsiusTemperature);
  document.querySelector("#feels-like").innerHTML = Math.round(feelsLikeTemperature);
  document.querySelector("#wind").innerHTML = `${Math.round(windSpeed)} km/h`;
}

function showPosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiKey = "1c0f6e49a911db65307b85186bd4t6oe";
  let apiUrl = `https://api.shecodes.io/weather/v1/current?lon=${lon}&lat=${lat}&key=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayTemperature).catch(showError);
}

function getCurrentPosition(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(showPosition);
}

document.querySelector("#search-form").addEventListener("submit", handleSubmit);
document.querySelector("#button-current-location").addEventListener("click", getCurrentPosition);
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);
celsiusLink.addEventListener("click", displayCelsiusTemperature);

// Start with a default city
search("Delhi");
