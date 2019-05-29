document.addEventListener('DOMContentLoaded', e => {
  let coords, isItRaining, lat, lng, minutelyForecast, precision, zip;

  const rainDiv = document.querySelector('#rain-div');
  const zipButton = document.querySelector('#zip-button');
  const zipDisplay = document.querySelector('#zip-display');
  const zipDisplayDiv = document.querySelector('#zip-display-div');
  const zipForm = document.querySelector('#zip-form');

  const url = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  chrome.storage.local.get(['zip', 'lat', 'lng'], (result) => {
    if (result.zip && zipDisplay) {
      zip = result.zip;
      zipDisplay.innerHTML += zip;
      zipForm.style.display = 'none';
    } else if (zipDisplayDiv) {
      zipDisplayDiv.style.display = 'none';
    };

    if (result.lat && result.lng) {
      lat = result.lat;
      lng = result.lng;

      getWeather();
    };
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'rain-button') {
      if (lat && lng) {
        getWeather();
      } else {
        alert('Please enter a five-digit zip code.');
      };
    } else if (e.target.id === 'zip-button') {
      chrome.storage.local.remove('zip');
      if (zipForm) {
        zipForm.style.display = '';
      };
    };
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'zip') {
      zip = e.target.value;
    };
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();

    if (e.target.id === 'zip-form') {
      if (!/^[0-9]{5}$/.test(zip) || !zip) {
        alert('Please enter a five-digit zip code.');
      } else {
        chrome.storage.local.set({zip: zip});

        fetch(url + `/location/${zip}`)
        .then(r => r.json())
        .then(res => getCoords(res));
      };
    };
  });

  const getCoords = (res) => {
    coords = res.results[0].geometry.location;
    lat = coords.lat.toFixed(3);
    lng = coords.lng.toFixed(3);

    chrome.storage.local.set({lat: lat, lng: lng});

    getWeather();
  };

  const getWeather = () => {
    fetch(url + `/weather/${lat},${lng}`)
    .then((r) => r.json())
    .then((res) => setIsItRaining(res));
  };

  const rainArr = [
    'It\'s probably not gonna rain (less than 10 percent probability).',
    'It could rain (10 to 50 percent probability).',
    'It\'s probably gonna rain (greater than 50 percent probability).',
    'It\'s probably raining now (greater than 90% probability).'
  ];

  const setIsItRaining = (res) => {
    if (res.minutely) {
      precision = 'minutely';

      let precipArr = res.minutely.data.map((min) => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 3;
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 2;
          } else if (prob >= 0.1) {
            isItRaining = 1;
          } else {
            isItRaining = 0;
          };
        });
      };
    } else if (res.hourly) {
      precision = 'hourly';

      let precipArr = res.hourly.data.slice(0, 2).map((min) => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 3;
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 2;
          } else if (prob >= 0.1) {
            isItRaining = 1;
          } else {
            isItRaining = 0;
          };
        });
      };
    };

    rainDiv.innerHTML = `${rainArr[isItRaining]}<br/>Precision: ${precision}.`;
  };
});
