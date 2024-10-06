import React from "react";
import styles from "@/styles/mapinfo.module.css";
const MapInfo = () => {
  return (
    <div className={styles.map_info_container}>
      <div className={styles.header}>
        <h3>Info</h3>
      </div>
      <div className={styles.map_info}>
        <div>
          <span className={styles.red_dot}></span>
          <p>
            It denotes the active fire or hotspots detected by NASA satellite.
          </p>
        </div>
        <div>
          <span className={styles.blue_dot}></span>
          <p>It denotes the Fire Detection physical device.</p>
        </div>
        <div>
          <span className={styles.yellow_dot}></span>
          <p>It denotes the reported fire by a user.</p>
        </div>
      </div>
    </div>
  );
};

export default MapInfo;
