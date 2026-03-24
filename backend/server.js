const express = require("express");
const cors = require("cors");
const getEvents = require("./fetchEvents");

const app = express();
app.use(cors());

app.get("/events", async (req, res) => {
    const events = await getEvents();
    res.json(events);
});

app.listen(3000, () => console.log("Server running on port 3000"));