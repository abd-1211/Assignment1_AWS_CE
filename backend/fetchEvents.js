const axios = require("axios");

const API_KEY = "YOUR_API_KEY";

async function getEvents() {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&countryCode=PK`;

    const response = await axios.get(url);

    return response.data._embedded.events.map(event => ({
        title: event.name,
        date: event.dates.start.localDate,
        venue: event._embedded.venues[0].name,
        image: event.images[0].url
    }));
}

module.exports = getEvents;