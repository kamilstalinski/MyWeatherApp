const apiKey = '1aea2c82b33f33484fe4babbf6bb420f';
const unsplashKey = 'Iu_v5uR8-lAQ0HwMQ8K-9kyQisOyDCZ5qqSUk_Lu1dU';
const googleApi = '';


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
const autocompleteItem = document.querySelector('.pac-item')
let input = document.getElementById('search-input');


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

            initMap(lat, long, data[0][0].name)

        })
        .catch(err => {
            console.log(err)
        })


}

//setting initial position of google maps
const initMap = (lat = 0, long = 0, city = null) => {

    let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: long },
        zoom: 10,
        styles: [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 13
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#144b53"
                    },
                    {
                        "lightness": 14
                    },
                    {
                        "weight": 1.4
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#08304b"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#0c4152"
                    },
                    {
                        "lightness": 5
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#0b434f"
                    },
                    {
                        "lightness": 25
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#0b3d51"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#146474"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#021019"
                    }
                ]
            }
        ]

    });

    let marker = new google.maps.Marker({
        position: { lat: lat, lng: long },
        map: map
    });

    const autocomplete = new google.maps.places.Autocomplete(input);

    let request = {};

    if (input.value) {
        request.query = input.value
    } else {
        request.query = city
    }

    let service = new google.maps.places.PlacesService(map)
    service.textSearch(request, callback)


}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let backgroundPhoto = results[0].photos[0].getUrl();
        const bgImage = `linear-gradient(0deg, rgba(0,0,0,0.8) 30%, rgba(255,255,255,0) 70%),url(${backgroundPhoto})`
        document.body.style.backgroundImage = bgImage;

    }
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
        // weatherContainer.classList.add('weather-active');
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
        weatherTemp.innerText = Math.ceil(temp) + '??';
        weatherHumidity.innerText = humidity + '%';
        weatherDescription.innerText = description;
        weatherWind.innerHTML = Math.round(wind_speed) + 'km/h';
        weatherClouds.innerHTML = clouds + '%';
        // weatherMinTemp.innerHTML =

        this.setIcon(description);
    },


    //Searching choosen city and converting it to coordinates
    searchCity: function () {
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


        if (description) {
            weatherIcon.setAttribute('src', `img/icons/${description}.svg`);
        }
    }
};

let dailyWeather = {
    setDailyWeather: (dailyData) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']



        for (let i = 0; i < dailyData.length - 5; i++) {
            const date = new Date(dailyData[i].dt * 1000);
            const dayName = days[date.getDay()];

            // const dailyContainer = document.querySelector('.next-days');
            // const detailsContainer = document.createElement('div')
            // const tempItems = document.createElement('div');
            // detailsContainer.classList.add('details-container');
            // const detailItem = document.createElement('div');
            // detailItem.classList.add('details-item');

            // dailyContainer.appendChild(detailsContainer);
            // detailsContainer.appendChild(detailItem);
            // detailItem.innerHTML = `
            // <div class="temp-items">
            // <h3>${dayName}</h3>
            // <p><span id="max">${Math.round(dailyData[i].temp.max)}??</span>/ <span id="min">${Math.round(dailyData[i].temp.min)}??C</span></p>
            // </div>
            // <img class="weather-icon" src="./img/icons/scattered clouds.svg" alt="weather-icon">
            // `



        }
    }
}

document.querySelector('.search-btn').addEventListener('click', () => {
    currentWeather.searchCity();
})

document.querySelector('.search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') currentWeather.searchCity();
});

if (autocompleteItem) {
    autocompleteItem.addEventListener('click', () => {
        console.log('dzia??a')
    })
}


window.addEventListener('load', () => {
    getLocation();
    setClockAndDate();
});

window.initMap = initMap;










