document.addEventListener('DOMContentLoaded', e => {
  let tint, coords, isItRaining, lat, lng, minutelyForecast, precision, zip;

  const errors = document.querySelector('#errors');
  const rainDiv = document.querySelector('#rain-div');
  const zipButton = document.querySelector('#zip-button');
  const zipDisplay = document.querySelector('#zip-display');
  const zipDisplayDiv = document.querySelector('#zip-display-div');
  const zipForm = document.querySelector('#zip-form');
  const zipInput = document.querySelector('#zip-input');

  const url = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  chrome.storage.local.get(['zip', 'lat', 'lng'], (result) => {
    if (result.zip) {
      zip = result.zip;
      zipDisplay.innerHTML = zip;
      zipForm.style.display = 'none';

      if (zip && (!result.lat || !result.lng)) {
        fetchCoords();
      };
    } else {
      zipDisplayDiv.style.display = 'none';
    };

    if (result.lat && result.lng) {
      clearErrors();

      lat = result.lat;
      lng = result.lng;

      fetchWeather();
    };
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'rain-button') {
      if (lat && lng) {
        clearErrors();
        fetchWeather();
      } else {
        errors.innerHTML = 'Please enter a five-digit zip code.';
      };
    } else if (e.target.id === 'zip-button') {
      clearErrors();

      zipDisplayDiv.style.display = 'none';
      zipForm.style.display = '';
      zipForm.value = '';
      zipInput.focus();
      zipInput.select();
      zipButton.style.display = 'none';
    };
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'zip-input') {
      clearErrors();
      zip = e.target.value;
    };
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();

    if (e.target.id === 'zip-form') {
      if (!/^[0-9]{5}$/.test(zip) || !zip) {
        errors.innerHTML = 'Please enter a five-digit zip code.';
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
    .then(r => r.json())
    .then(res => getCoords(res));
  };

  const fetchWeather = () => {
    fetch(url + `/weather/${lat},${lng}`)
    .then((r) => r.json())
    .then((res) => setIsItRaining(res));
  };

  const clearErrors = () => {
    errors.innerHMTL = '';
  };

  const rainArr = [
    [
      ['It\'s not gonna rain'],
      ['(<10% probability']
    ],[
      ['It could rain'],
      ['(10% - 50% probability']
    ],[
      ['It\'s gonna rain'],
      ['(>50% probability']
    ],[
      ['It\'s like, raining'],
      ['(>90% probability']
    ]
  ];

  const setIsItRaining = (res) => {
    if (res.minutely) {
      precision = 'minutely';

      let precipArr = res.minutely.data.map((min) => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 3;
        tint = 'cyan';
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 2;
            tint = 'cyan';
          } else if (prob >= 0.1) {
            isItRaining = 1;
            tint = '#eee';
          } else {
            isItRaining = 0;
            tint = 'yellow';
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
        tint = 'cyan';
      } else {
        precipArr.forEach((prob) => {
          if (prob >= 0.5) {
            isItRaining = 2;
            tint = 'cyan';
          } else if (prob >= 0.1) {
            isItRaining = 1;
            tint = '#eee';
          } else {
            isItRaining = 0;
            tint = 'yellow';
          };
        });
      };
    };

    let hourlyOrMinutely =  ((precision === 'minutely' && isItRaining === 3) ? 'in the next minute)' : 'in the next hour)');

    rainDiv.innerHTML = `
      <div id='headline'>${rainArr[isItRaining][0]}</div>
      <div id="sub">${rainArr[isItRaining][1]} ${hourlyOrMinutely}</div>
    `;

    const headline = document.querySelector('#headline');
    headline.style.color = tint;
  };
});
