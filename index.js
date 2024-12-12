import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { XMLParser } from "fast-xml-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" });

app.get("/getEventInfo", async (req, res) => {
  try {
    const response = await fetch("https://www.lcsd.gov.hk/datagovhk/event/events.xml");
    const xmlData = await response.text();
    const jsonData = parser.parse(xmlData);
    const events = jsonData.events.event.map((event) => ({
      ...event,
      eventId: event["@id"],
    }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/getEventVenueInfo", async (req, res) => {
  try {
    const response = await fetch("https://www.lcsd.gov.hk/datagovhk/event/venues.xml");
    const xmlData = await response.text();
    const jsonData = parser.parse(xmlData);

    const venues = {};
    jsonData.venues.venue.forEach((venue) => {
      const id = venue["@id"];
      venues[id] = {
        venuec: venue.venuec.trim(),
        venuee: venue.venuee.trim(),
        latitude: venue.latitude || null, // Default to null if not available
        longitude: venue.longitude || null, // Default to null if not available
      };
    });

    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`server is starting at ${process.env.PORT}`);
});
