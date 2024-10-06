"use client";
import React, { useRef, useState, useEffect } from "react";
import { loadModules } from "esri-loader";
import { useSelector } from "react-redux";
import styles from "@/styles/map.module.css";

const Map = () => {
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [deviceData, setDeviceData] = useState([]);
  const [reportedFires, setReportedFires] = useState([]);
  const [name, setName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [isReportFire, setisReportFire] = useState(false);

  const basemap = useSelector((state) => state.basemap.basemap);
  const nasaFireData = useSelector((state) => state.fireDate.nasaFireData);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const roundedLatitude = parseFloat(latitude.toFixed(7));
          const roundedLongitude = parseFloat(longitude.toFixed(7));
          setLocation({
            latitude: roundedLatitude,
            longitude: roundedLongitude,
          });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch("http://localhost:3000/device-data");
        const data = await response.json();
        setDeviceData(data);
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    };
    fetchDeviceData();
  }, []);

  useEffect(() => {
    const fetchReportedFires = async () => {
      try {
        const response = await fetch("http://localhost:3000/reported-fires");
        const data = await response.json();
        setReportedFires(data);
      } catch (error) {
        console.error("Error fetching reported fires:", error);
      }
    };
    fetchReportedFires();
  }, []);

  useEffect(() => {
    let view;
    let graphicsLayer;
    let deviceLayer;
    let reportedFireLayer;

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
      ],
      { css: true }
    )
      .then(([Map, MapView, GraphicsLayer, Graphic]) => {
        const map = new Map({
          basemap: basemap,
        });

        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [85.324, 27.7172],
          zoom: 7,
        });

        if (nasaFireData) {
          const graphics = nasaFireData.features.map((feature) => {
            return new Graphic({
              geometry: {
                type: "point",
                longitude: feature.geometry.coordinates[0],
                latitude: feature.geometry.coordinates[1],
              },
              symbol: {
                type: "simple-marker",
                color: "red",
                size: "8px",
                outline: {
                  color: "white",
                  width: 1,
                },
              },
              attributes: feature.properties,
              popupTemplate: {
                title: "{country_id} Active Fire",
                content: `
                  <b>Latitude:</b> {latitude}<br>
                  <b>Longitude:</b> {longitude}<br>
                  <b>Brightness (TI4):</b> {bright_ti4}<br>
                  <b>Brightness (TI5):</b> {bright_ti5}<br>
                  <b>FRP:</b> {frp}<br>
                  <b>Date:</b> {acq_date}<br>
                  <b>Time:</b> {acq_time}<br>
                  <b>Satellite:</b> {satellite}<br>
                  <b>Instrument:</b> {instrument}<br>
                  <b>Confidence:</b> {confidence}<br>
                  <b>Day/Night:</b> {daynight}
                `,
              },
            });
          });

          graphicsLayer = new GraphicsLayer({
            graphics: graphics,
          });

          map.add(graphicsLayer);
        }

        function formatDate(dateString) {
          const date = new Date(dateString);
          const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };
          return date.toLocaleDateString("en-US", options);
        }

        const deviceGraphics = deviceData.map((device) => {
          const formattedDate = formatDate(device.updatedAt);
          return new Graphic({
            geometry: {
              type: "point",
              longitude: device.longitude,
              latitude: device.latitude,
            },
            symbol: {
              type: "simple-marker",
              color: device.isFireDetected ? "red" : "blue",
              size: "12px",
              outline: {
                color: device.isFireDetected ? "red" : "white",
                width: 1,
              },
            },
            attributes: {
              objectId: device._id,
              ...device,
            },
            popupTemplate: {
              title: "Device Data",
              content: `
              <b>Temperature:</b> ${device.temperature}°<br>
                <b>Humidity:</b> ${device.humidity}%<br>
                <b>LPG:</b> ${device.lpg}ppm<br>
                <b>CO:</b> ${device.co}ppm<br>
                <b>Smoke:</b> ${device.smoke}ppm<br>
                <b>Fire Detected:</b> ${device.isFireDetected ? "Yes" : "No"}<br>
                <b>Updated At:</b> ${formattedDate}
              `,
            },
          });
        });

        deviceLayer = new GraphicsLayer({
          graphics: deviceGraphics,
        });
        map.add(deviceLayer);
        const reportedFireGraphics = reportedFires
          .map((fire) => {
            if (!fire.longitude || !fire.latitude) {
              console.error(
                "Missing longitude or latitude for reported fire:",
                fire
              );
              return null;
            }

            return new Graphic({
              geometry: {
                type: "point",
                longitude: fire.longitude,
                latitude: fire.latitude,
              },
              symbol: {
                type: "simple-marker",
                color: "yellow",
                size: "8px",
                outline: {
                  color: "yellow",
                  width: 8,
                },
              },
              attributes: {
                objectId: fire._id,
                ...fire,
              },
              popupTemplate: {
                title: "Reported Fire",
                content: `
                <b>Reporter Name:</b> ${fire.name}<br>
                <b>Reporter Phone:</b> ${fire.phone}<br>
                <b>Reported Date:</b> ${new Date(fire.date).toLocaleString()}<br>
              `,
              },
            });
          })
          .filter((graphic) => graphic !== null);

        reportedFireLayer = new GraphicsLayer({
          graphics: reportedFireGraphics,
        });

        map.add(reportedFireLayer);

        view.on("pointer-move", (event) => {
          view.hitTest(event).then((response) => {
            const graphic = response.results.find(
              (result) =>
                result.graphic.layer === graphicsLayer ||
                result.graphic.layer === deviceLayer ||
                result.graphic.layer === reportedFireLayer
            );
            if (graphic) {
              view.container.style.cursor = "pointer";
            } else {
              view.container.style.cursor = "default";
            }
          });
        });
      })
      .catch((err) => console.error(err));

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [nasaFireData, deviceData, reportedFires, basemap]);

  const ReportFire = async (e) => {
    e.preventDefault();
    if (!location.latitude || !location.longitude) {
      alert("Location should be enabled.");
      return;
    }
    const response = await fetch("http://localhost:3000/report-fire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone: phonenumber,
        location,
      }),
    });
    const data = await response.json();
    if (data.saved) {
      alert("Fire location has been reported.");
      setReportedFires([...reportedFires, data.report]);
    } else {
      alert("Something went wrong. Try again.");
    }
    setName("");
    setPhonenumber("");
    setisReportFire(false);
  };

  return (
    <>
      {isReportFire && (
        <div className={styles.report_fire_container}>
          <div className={styles.report_fire_popup}>
            <header>
              Report Fire
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                onClick={() => setisReportFire(false)}
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </header>
            <form onSubmit={ReportFire}>
              <div>
                <label htmlFor="name">Name of reporter* </label>
                <input
                  type="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="number">Phone number of reporter* </label>
                <input
                  type="number"
                  id="number"
                  value={phonenumber}
                  onChange={(e) => setPhonenumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="latitude">Fire location(latitude)* </label>
                <input
                  type="number"
                  id="latitude"
                  value={location.latitude}
                  required
                  disabled
                />
              </div>

              <div>
                <label htmlFor="longitude">Fire location(longitude)* </label>
                <input
                  type="number"
                  id="longitude"
                  value={location.longitude}
                  required
                  disabled
                />
              </div>
              <p>
                Note: Location of the fire will be determined around 100m of
                your current location.
              </p>
              <button type="submit">Report Fire</button>
            </form>
          </div>
        </div>
      )}

      <div className={styles.map} ref={mapRef}>
        <div className={styles.report_fire}>
          <button type="submit" onClick={() => setisReportFire(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="currentColor"
            >
              <path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z" />
            </svg>
            Report Fire
          </button>
        </div>
      </div>
    </>
  );
};

export default Map;
