require("dotenv").config();
const axios = require("axios");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure AWS S3
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const BUCKET_NAME = "eventmanager-poster-store"; // replace with your S3 bucket name

const API_KEY = process.env.API_KEY;

async function uploadImageToS3(imageUrl) {
    try {
        const response = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "arraybuffer",
        });

        const fileName = `${uuidv4()}.jpg`;

        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: response.data,
            ContentType: "image/jpeg",
            
        }).promise();

        // Generate signed URL valid for 1 hour
        const signedUrl = s3.getSignedUrl("getObject", {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Expires: 3600,
        });

        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (err) {
        console.error("S3 Upload Error:", err.message);
        return null;
    }
}

async function getEvents() {
    try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;

        if (!data._embedded || !data._embedded.events) return [];

        const events = [];

        for (const event of data._embedded.events) {
            const imageUrl = event.images?.[0]?.url;
            const s3Url = imageUrl ? await uploadImageToS3(imageUrl) : null;

            events.push({
                title: event.name || "No title",
                date: event.dates?.start?.localDate || "No date",
                venue: event._embedded?.venues?.[0]?.name || "No venue",
                image: s3Url || "",
            });
        }

        return events;
    } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        return [];
    }
}

module.exports = getEvents;