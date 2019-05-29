# Is It Gonna Rain?

Is It Gonna Rain? is a Chrome extension that answers one simple question: how likely is it to rain in the next hour where you are?

Provide a five-digit U.S. zip code, and the extension will query an API that in turn talks to Google's Geocoding API to grab coordinates. 

These coordinates are then fed to the Dark Sky API, and the results of that query are crunched to tell you whether you should bring an umbrella when you go out to lunch.

There are four possible responses:

- "It's not gonna rain": there is a less-than-10% probability that it will rain in the provided zip code in the next hour
- "It could rain": the probability that it will rain in the provided zip code in the next hour is between 10% and 50%
- "It's gonna rain": the probability that it will rain in the provided zip code in the next hour is greater than 50%
- "It's like, raining": the probability that it will rain in the next minute (or hour, if minute-by-minute precision isn't available in your zip code) is greater than 90%

This extension is available under the MIT License. Please [contact](https://davidfloyd91.github.io/contact/) me with any issues, suggestions, etc.

