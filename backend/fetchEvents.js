require("dotenv").config();
const axios = require("axios");


const API_KEY = process.env.API_KEY;

async function getEvents() {
    try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}`;

        const response = await axios.get(url);
        const data = response.data;
        console.log(JSON.stringify(data, null, 2));
        // Check if _embedded exists
        if (!data._embedded || !data._embedded.events) {
            console.warn("No events found in API response");
            return []; // return empty array instead of crashing
        }

        return data._embedded.events.map(event => ({
            title: event.name || "No title",
            date: event.dates?.start?.localDate || "No date",
            venue: event._embedded?.venues?.[0]?.name || "No venue",
            image: event.images?.[0]?.url || ""
        }));

    } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        return [];
    }
}

module.exports = getEvents;