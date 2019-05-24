document.addEventListener('DOMContentLoaded', e => {
  const rainDiv = document.querySelector('#rain-div');
  const url = 'http://is-it-raining-env.mqxjxhgsyd.us-east-1.elasticbeanstalk.com';

  let minutelyForecast, isItRaining;

  // you need to grab these somehow
  const lat = 41.584;
  const lng = -93.681;

  document.addEventListener('click', e => {
    if (e.target.id === 'rain-button' && lat && lng) {
      fetch(url + `/weather/${lat},${lng}`)
      .then(r => r.json())
      .then(res => setIsItRaining(res));
    };
  });

  const rainArr = [
    'It\'s probably not going to rain',
    'It could rain.',
    'It\'s probably gonna rain.',
    'It\'s raining now.'
  ];

  const setIsItRaining = res => {
    if (res.minutely) {
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

    rainDiv.innerHTML += `${rainArr[isItRaining]}`;
  };
});
