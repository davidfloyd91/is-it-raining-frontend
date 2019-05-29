# Is It Gonna Rain?

Is It Gonna Rain? is a Chrome extension that answers one simple question: how likely is it to rain in the next hour where you are?

Provide a five-digit U.S. zip code, and the extension will query a dedicated [API](https://github.com/davidfloyd91/is-it-raining) that in turn talks to [Google's Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) to grab coordinates. 

These coordinates are then fed to the [Dark Sky API](https://darksky.net/dev), and the results of that query are crunched to tell you whether you should bring an umbrella when you go out to lunch.

There are four possible responses:

- __"It's not gonna rain":__ there is a less-than-10% probability that it will rain in the provided zip code in the next hour
- __"It could rain":__ the probability that it will rain in the provided zip code in the next hour is between 10% and 50%
- __"It's gonna rain":__ the probability that it will rain in the provided zip code in the next hour is greater than 50%
- __"It's like, raining":__ the probability that it will rain in the next minute (or hour, if minute-by-minute precision isn't available in your zip code) is greater than 90%

This extension is available under the MIT License. Please [contact](https://davidfloyd91.github.io/contact/) me with any issues, suggestions, etc.

