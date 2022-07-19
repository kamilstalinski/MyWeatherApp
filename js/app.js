const apiKey = '1aea2c82b33f33484fe4babbf6bb420f'

//Downloading HTML elements
const weatherCity = document.getElementById('city');
const weatherTemp = document.getElementById('temp');
const weatherHumidity = document.getElementById('humidity');
const weatherDate = document.getElementById('date');
const weatherDescription = document.getElementById('description');
const weatherWind = document.getElementById('wind');
const weatherClouds = document.getElementById('clouds');
const weatherMinTemp = document.getElementById('min');
const weatherMaxTemp = document.getElementById('max');
const weatherContainer = document.querySelector('.weather');
const additionalContainer = document.querySelector('.details-container')
const detailsContainer = document.querySelector('.additional-info');
const dailyContainer = document.querySelector('.next-days');
const loader = document.querySelector('.loader');


let cityName;
let lat;
let long;

//Getting current coordinates and running main function
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            long = position.coords.longitude;

            fetchWeatherAPI(lat, long)

        })
    } else {
        alert('Geolocation is not supported in this browser')
    }
}

//Fetching weather data
const fetchWeatherAPI = (lat, long) => {

    Promise.all([
        fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=5&appid=${apiKey}`)
            .then(res => res.json()),
        fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&exclude=minutely,alert&units=metric&appid=${apiKey}`)
            .then(res => res.json())
    ])
        .then(data => {
            currentWeather.setCurrentWeather(data[0][0].name, data[1].current);
            dailyWeather.setDailyWeather(data[1].daily);
            initMap(lat, long)
        })
        .catch(err => {
            console.log(err)
        })

}

//setting initial position of google maps
const initMap = (lat = 0, long = 0) => {

    let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: long },
        zoom: 10,
    });

    let marker = new google.maps.Marker({
        position: { lat: lat, lng: long },
        map: map
    });
}

//Setting current Time and Date
const setClockAndDate = () => {
    setInterval(() => {
        const date = new Date();
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let day = date.getDay();
        let monthName = month[date.getMonth()]
        let year = date.getFullYear();

        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;

    }, 1000)
}

//Object which stores functions about current weather
let currentWeather = {

    // Setting current weather from API by changing DOM
    setCurrentWeather: function (cityName, weatherData) {
        loader.classList.add('hide')
        weatherContainer.classList.add('weather-active');
        detailsContainer.classList.add('active');

        const date = new Date(weatherData.dt * 1000)
        let hours = date.getHours();
        let minutes = date.getMinutes();

        weatherDate.innerText = `${hours}:${minutes}`;


        const { temp, humidity } = weatherData;
        const { description } = weatherData.weather[0];
        const { wind_speed } = weatherData;
        const { clouds } = weatherData;

        weatherCity.innerText = cityName;
        weatherTemp.innerText = Math.ceil(temp) + '°';
        weatherHumidity.innerText = humidity + '%';
        weatherDescription.innerText = description;
        weatherWind.innerHTML = Math.round(wind_speed) + 'km/h';
        weatherClouds.innerHTML = clouds + '%';
        // weatherMinTemp.innerHTML =

        this.setIcon(description);
    },


    //Searching choosen city and converting it to coordinates
    searchCity: function () {
        let input = document.querySelector('.search');

        if (input.value) {
            fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${input.value}&limit=1&appid=${apiKey}`)
                .then(res => res.json())
                .then(data => {

                    loader.classList.remove('hide');


                    lat = data[0].lat;
                    long = data[0].lon;

                    setTimeout(() => {
                        dailyContainer.innerHTML = '';
                        fetchWeatherAPI(lat, long)
                        initMap(lat, long);
                        input.value = '';
                    }, 1000);
                })
        } else {
            alert('Search field cannot be empty!')
        }
    },

    //Setting weather icon and background according to current weather 
    setIcon: function (description) {
        const weatherIcon = document.getElementById('icon')
        const bgImage = `linear-gradient(180deg, rgba(68, 78, 88, 0.1) 50%, rgb(0, 0, 0) 100%), url("./img/background/${description}.jpg")`

        if (description) {
            weatherIcon.setAttribute('src', `img/icons/${description}.svg`);
            // document.body.style.backgroundImage = bgImage;
        }
    }
};

let dailyWeather = {
    setDailyWeather: (dailyData) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']



        for (let i = 0; i < dailyData.length - 5; i++) {
            const date = new Date(dailyData[i].dt * 1000);
            const dayName = days[date.getDay()];

            const dailyContainer = document.querySelector('.next-days');
            const detailsContainer = document.createElement('div')
            const tempItems = document.createElement('div');
            detailsContainer.classList.add('details-container');
            const detailItem = document.createElement('div');
            detailItem.classList.add('details-item');

            dailyContainer.appendChild(detailsContainer);
            detailsContainer.appendChild(detailItem);
            detailItem.innerHTML = `
            <div class="temp-items">
            <h3>${dayName}</h3>
            <p><span id="max">${Math.round(dailyData[i].temp.max)}°</span>/ <span id="min">${Math.round(dailyData[i].temp.min)}°C</span></p>
            </div>
            <img class="weather-icon" src="./img/icons/scattered clouds.svg" alt="weather-icon">
            `



        }
    }
}

document.querySelector('.search-btn').addEventListener('click', () => {
    currentWeather.searchCity();
})

document.querySelector('.search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') currentWeather.searchCity();
});

window.addEventListener('load', () => {
    getLocation();
    setClockAndDate();
});

window.initMap = initMap;






