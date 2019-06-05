document.addEventListener('DOMContentLoaded', e => {
  let coords,
      icon,
      isItRaining,
      lat,
      lng,
      minutelyForecast,
      precision,
      zip;

  const errors        = document.querySelector('#errors');
  const headline      = document.querySelector('#headline');
  const rainDiv       = document.querySelector('#rain-div');
  const sub           = document.querySelector('#sub');
  const zipButton     = document.querySelector('#zip-button');
  const zipDisplay    = document.querySelector('#zip-display');
  const zipDisplayDiv = document.querySelector('#zip-display-div');
  const zipForm       = document.querySelector('#zip-form');
  const zipInput      = document.querySelector('#zip-input');

  const url           = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  chrome.storage.local.get(['zip', 'lat', 'lng'], (result) => {
    if (result.zip && zipDisplay) {
      zip = result.zip;
      zipDisplay.innerHTML = zip;
      zipForm.style.display = 'none';

      if (zip && (!result.lat || !result.lng)) {
        fetchCoords();
      };
    } else {
      if (zipDisplayDiv) {
        zipDisplayDiv.style.display = 'none';
      };

      if (errors) {
        errors.innerHTML = 'Please enter a five-digit zip code.';
        zipInput.focus();
        zipInput.select();
      };
    };

    if (result.lat && result.lng) {
      clearErrors();

      lat = result.lat;
      lng = result.lng;

      fetchWeather();
    };
  });

  // chrome.alarms.create({ periodInMinutes: 10 });

  chrome.runtime.onMessage.addListener((message) => {
    chrome.browserAction.setIcon({
      path: message.newIconPath,
    });
  });

  // chrome.alarms.onAlarm.addListener((alarm) => {
  //   // more error handling here
  //   if (lat && lng) {
  //     fetchWeather();
  //   };
  // });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'rain-button') {
      if (lat && lng) {
        clearErrors();
        fetchWeather();
      } else {
        errors.innerHTML = 'Please enter a five-digit zip code.';
        headline.innerHTML = '';
        sub.innerHTML = '';
        zipInput.focus();
        zipInput.select();
      };
    } else if (e.target.id === 'zip-button') {
      clearErrors();

      zipDisplayDiv.style.display = 'none';
      zipForm.style.display = '';
      zipInput.focus();
      zipInput.select();
      zipButton.style.display = 'none';
    };
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'zip-input') {
      zip = e.target.value;
    };
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();

    if (e.target.id === 'zip-form') {
      if (!/^[0-9]{5}$/.test(zip) || !zip) {
        errors.innerHTML = 'Please enter a five-digit zip code.';
        zipInput.focus();
        zipInput.select();
      } else {
        clearErrors();

        zipDisplayDiv.style.display = '';
        zipDisplay.innerHTML = zip;
        zipForm.style.display = 'none';
        zipButton.style.display = '';

        chrome.storage.local.set({zip: zip});

        fetchCoords();
      };
    };
  });

  const getCoords = (res) => {
    coords = res.results[0].geometry.location;
    lat = coords.lat.toFixed(3);
    lng = coords.lng.toFixed(3);

    chrome.storage.local.set({lat: lat, lng: lng});

    fetchWeather();
  };

  const fetchCoords = () => {
    fetch(url + `/location/${zip}`)
    .then((r) => r.json())
    .catch((err) => {
      if (errors) {
        errors.innerHTML = 'Sorry, something went wrong ...';
      };
    })
    .then((res) => {
      if (res) {
        getCoords(res);
      };
    });
  };

  const fetchWeather = () => {
    fetch(url + `/weather/${lat},${lng}`)
    .then((r) => r.json())
    .catch((err) => {
      if (errors) {
        errors.innerHTML = 'Sorry, something went wrong ...';
      };
    })
    .then((res) => {
      if (res) {
        setIsItRaining(res);
      };
    });
  };

  const clearErrors = () => {
    if (errors) {
      errors.innerHTML = '';
    };
  };

  const rainObj = {
    no: {
      headline: 'It\'s not gonna rain',
      sub: '(<10% probability',
      icon: 'weather-sunny.png',
      color: '#d8cb0d'
    },
    maybe: {
      headline: 'It could rain',
      sub: '(10% - 50% probability',
      icon: 'weather-cloudy.png',
      color: '#eee'
    },
    yes: {
      headline: 'It\'s gonna rain',
      sub: '(>50% probability',
      icon: 'weather-shower.png',
      color: '#27acc6'
    },
    now: {
      headline: 'It\'s like, raining',
      sub: '(>90% probability',
      icon: 'weather-downpour.png',
      color: '#27acc6'
    }
  };

  const setIsItRaining = (res) => {
    if (res.minutely) {
      precision = 'minutely';

      let precipArr = res.minutely.data.map((min) => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 'now';
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 'yes';
          } else if (prob >= 0.1) {
            isItRaining = 'maybe';
          } else {
            isItRaining = 'no';
          };
        });
      };
    } else if (res.hourly) {
      precision = 'hourly';

      let precipArr = res.hourly.data.slice(0, 2).map((min) => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 'now';
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 'yes';
          } else if (prob >= 0.1) {
            isItRaining = 'maybe';
          } else {
            isItRaining = 'no';
          };
        });
      };
    };

    let hourlyOrMinutely = (
      (precision === 'minutely' && isItRaining === 'now')
        ?
      ' in the next minute)'
        :
      ' in the next hour)'
    );

    chrome.runtime.sendMessage(
      { 'newIconPath': 'icons/' + rainObj[isItRaining].icon }
    );

    if (headline) {
      headline.innerHTML = rainObj[isItRaining].headline;
      headline.style.color = rainObj[isItRaining].color;
    };

    if (sub) {
      sub.innerHTML = rainObj[isItRaining].sub + hourlyOrMinutely;
    };
  };
});
