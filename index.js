document.addEventListener('DOMContentLoaded', e => {
  const rainDiv = document.querySelector('#rain-div');
  const url = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  let minutelyForecast, isItRaining, precision;

  // you need to grab these somehow
  const lat = 41.584;
  const lng = -43.681;

  document.addEventListener('click', e => {
    if (e.target.id === 'rain-button' && lat && lng) {
      fetch(url + `/weather/${lat},${lng}`)
      .then(r => r.json())
      .then(res => setIsItRaining(res));
    };
  });

  const rainArr = [
    'It\'s probably not going to rain (less than 10 percent probability).',
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
