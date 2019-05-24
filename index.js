chrome.runtime.onInstalled.addListener(() => {
  console.log('Installed!');

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

document.addEventListener('DOMContentLoaded', e => {
  const rainDiv = document.querySelector('#rain-div');
  const url = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  let minutelyForecast, isItRaining, precision, zip, coords, lat, lng;

  document.addEventListener('click', e => {
    if (e.target.id === 'rain-button') {
      if (lat && lng) {
        fetch(url + `/weather/${lat},${lng}`)
        .then(r => r.json())
        .then(res => setIsItRaining(res));
      } else {
        alert('Please enter a five-digit zip code.');
      };
    };
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'zip') {
      zip = e.target.value;
    };
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'zip-form') {
      if (!/^[0-9]{5}$/.test(zip) || !zip) {
        alert('Please enter a five-digit zip code.');
      } else {
        fetch(url + `/location/${zip}`)
        .then(r => r.json())
        .then(res => getCoords(res));
      };
    };
  });

  const getCoords = res => {
    coords = res.results[0].geometry.location;
    lat = coords.lat.toFixed(3);
    lng = coords.lng.toFixed(3);
  };

  const rainArr = [
    'It\'s probably not gonna rain (less than 10 percent probability).',
    'It could rain (10 to 50 percent probability).',
    'It\'s probably gonna rain (greater than 50 percent probability).',
    'It\'s probably raining now (greater than 90% probability).'
  ];

  const setIsItRaining = res => {
    if (res.minutely) {
      precision = 'minutely';

      let precipArr = res.minutely.data.map(min => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 3;
      } else {
        precipArr.forEach(prob => {
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

      let precipArr = res.hourly.data.slice(0, 2).map(min => {
        return min.precipProbability;
      });

      if (precipArr[0] >= 0.9) {
        isItRaining = 3;
      } else {
        precipArr.forEach(prob => {
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
