"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBasemap } from "../store/basemapSlice";
import { setFireDate, setNasaFireData } from "@/store/fireDataSlice";
import styles from "@/styles/settings.module.css";

const Settings = () => {
  const [selectedDate, setSelectedDate] = useState("");

  const dispatch = useDispatch();
  const basemap = useSelector((state) => state.basemap.basemap);
  const basemaps = ["satellite", "hybrid", "topo", "osm"];

  const handleChange = (e) => {
    dispatch(setBasemap(e.target.value));
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleViewActiveFire = () => {
    if (!selectedDate) {
      alert("Select Date.");
      return;
    }

    dispatch(setFireDate(selectedDate));
    fetchFireData(selectedDate);
  };

  const fetchFireData = async (date) => {
    try {
      const response = await fetch(
        `https://firms.modaps.eosdis.nasa.gov/api/country/csv/NASA_API/VIIRS_SNPP_NRT/NPL/10/${date}`
      );
      const csvText = await response.text();
      const rows = csvText.trim().split("\n").slice(1);
      const features = rows.map((row) => {
        const cols = row.split(",");
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(cols[2]), parseFloat(cols[1])],
          },
          properties: {
            country_id: cols[0],
            latitude: cols[1],
            longitude: cols[2],
            bright_ti4: cols[3],
            scan: cols[4],
            track: cols[5],
            acq_date: cols[6],
            acq_time: cols[7],
            satellite: cols[8],
            instrument: cols[9],
            confidence: cols[10],
            version: cols[11],
            bright_ti5: cols[12],
            frp: cols[13],
            daynight: cols[14],
          },
        };
      });

      const geojson = {
        type: "FeatureCollection",
        features: features,
      };
      dispatch(setNasaFireData(geojson));
    } catch (error) {
      console.error("Error fetching fire data:", error);
    }
  };

  return (
    <div className={styles.settings_container}>
      <div className={styles.header}>
        <h3>Settings</h3>
      </div>
      <div className={styles.settings}>
        <div className={styles.basemap_switcher}>
          <h4>Choose Layer</h4>
          <div>
            <label htmlFor="basemap_select">Layers</label>
            <select
              value={basemap}
              onChange={handleChange}
              className={styles.basemap_select}
            >
              {basemaps.map((basemap) => (
                <option key={basemap} value={basemap}>
                  {basemap}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.active_fire}>
          <h4>Active Fire</h4>
          <div>
            <div className={styles.info_container}>
              <label htmlFor="date">Date</label>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="14px"
                viewBox="0 -960 960 960"
                width="14px"
                fill="currentColor"
              >
                <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>
              <p>
                Active fire will be shown from the "selected date" to 10 days
                after.
              </p>
            </div>
            <input
              type="date"
              id="date"
              onChange={handleDateChange}
              className={styles.input_date}
            />
          </div>

          <button type="submit" onClick={handleViewActiveFire}>
            View Active Fire
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
