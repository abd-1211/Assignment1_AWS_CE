require("dotenv").config
const express = require("express");
const cors = require("cors");
const getEvents = require("./fetchEvents");

const app = express();
app.use(cors());
app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
app.get("/events", async (req, res) => {
    const events = await getEvents();
    res.json(events);
});

