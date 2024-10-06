"use client";
import React, { useState, useEffect } from "react";
import styles from "@/styles/subscribe.module.css";
const Subscribe = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [name, setName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const SubscribeToFireAlert = async (e) => {
    e.preventDefault();
    console.log(location);
    if (!location.latitude || !location.longitude) {
      alert("Location should be enabled.");
      return;
    }
    const response = await fetch("http://localhost:3000/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phonenumber,
        location,
      }),
    });
    const data = await response.json();
    if (data.saved) {
      alert("Subscribed to Fire Alerts.");
    } else {
      alert("Something went wront. Try again.");
    }
    setName("");
    setPhonenumber("");

  };
  return (
    <div className={styles.subscribe_container}>
      <div className={styles.header}>
        <h3>Subscribe</h3>
        <p>Get notification of fire within 100m of your location.</p>
      </div>
      <div className={styles.subscribe}>
        <form onSubmit={SubscribeToFireAlert}>
          <div>
            <label htmlFor="name">Name* </label>
            <input
              type="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="number">Phone Number* </label>
            <input
              type="number"
              id="number"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  );
};

export default Subscribe;
