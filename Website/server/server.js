const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const geolib = require("geolib");
const Data = require("./dataModel");
const User = require("./userSchema");
const ReportedFire = require("./reportedFireModel");
const venom = require("venom-bot");
const port = 3000;
require("./con_to_db");

const app = express();
app.use(
  cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  })
);
app.use(bodyParser.json());

let client;
venom
  .create({
    session: "fire-detection",
    multidevice: true,
    headless: true,
    devtools: false,
    useChrome: true,
    browserArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  .then((venomClient) => {
    client = venomClient;
    console.log("Venom client is ready!");
  })
  .catch((err) => console.log("Error initializing Venom:", err));


const sendMessages = async (fireLocation) => {
  if (!client) {
    console.log("Venom client is not ready yet.");
    return;
  }
  try {
    const users = await User.find();
    const contacts = users
      .filter((user) => {
        const distance = geolib.getDistance(
          {
            latitude: fireLocation.latitude,
            longitude: fireLocation.longitude,
          },
          { latitude: user.latitude, longitude: user.longitude }
        );
        return distance <= 100; // distance in meters
      })
      .map((user) => ({
        phone: user.phone,
        name: user.name,
      }));

    if (contacts.length > 0) {
      for (let contact of contacts) {
        const message = `Hi ${contact.name}, there is a fire detected near your location. http://www.google.com/maps/place/${fireLocation.latitude},${fireLocation.longitude}`;
        await client.sendText(contact.phone + "@c.us", message);
      }
    } else {
      console.log("No users within 100 meters of the fire detected.");
    }
  } catch (err) {
    console.log(err);
  }
};

app.post("/data", async (req, res) => {
  const dataString = req.body.data;
  const dataArray = dataString.split(" ");

  if (dataArray.length !== 8) {
    return res.status(400).send("Invalid data format");
  }

  const isFireDetected = dataArray[7] === "true";

  const newData = {
    humidity: parseFloat(dataArray[0]),
    temperature: parseFloat(dataArray[1]),
    lpg: parseFloat(dataArray[2]),
    co: parseFloat(dataArray[3]),
    smoke: parseFloat(dataArray[4]),
    latitude: parseFloat(dataArray[5]),
    longitude: parseFloat(dataArray[6]),
    isFireDetected: isFireDetected,
  };
  console.log(newData);
  try {
    const updatedData = await Data.findOneAndUpdate(
      {
        latitude: parseFloat(dataArray[5]),
        longitude: parseFloat(dataArray[6]),
      },
      newData,
      { new: true, upsert: true }
    );

    if (isFireDetected) {
      sendMessages({
        latitude: parseFloat(dataArray[5]),
        longitude: parseFloat(dataArray[6]),
      });
    }

    res.status(200).send(`Data processed with id: ${updatedData._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing data");
  }
});

app.post("/report-fire", async (req, res) => {
  const { name, phone, location } = req.body;
  const newReport = new ReportedFire({
    name,
    phone,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  try {
    const savedReport = await newReport.save();
    sendMessages({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    res.status(200).send({ saved: true, report: savedReport });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error reporting fire");
  }
});

app.get("/reported-fires", async (req, res) => {
  try {
    const reportedFires = await ReportedFire.find();
    res.json(reportedFires);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching reported fires");
  }
});

app.get("/device-data", async (req, res) => {
  try {
    const deviceData = await Data.find();
    console.log(deviceData);
    res.json(deviceData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching device data");
  }
});

app.post("/subscribe", async (req, res) => {
  const userData = new User({
    name: req.body.name,
    phone: req.body.phonenumber,
    latitude: req.body.location.latitude,
    longitude: req.body.location.longitude,
  });
  try {
    await userData.save();
    res.status(200).send({ saved: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error inserting data");
  }
});

app.post("/download-data", async (req, res) => {
  try {
    const deviceData = await Data.find({}, "-_id -__v");
    const reportedFires = await ReportedFire.find({}, "-_id -__v");
    const nasaFireData = req.body.nasaFireData;

    const combinedData = {
      deviceData,
      reportedFires,
      nasaFireData,
    };

    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching data", error);
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
