"use client";
import styles from "@/styles/additional_resources.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";

const AdditionalResources = () => {
  const nasaFireData = useSelector((state) => state.fireDate.nasaFireData);

  const downloadData = async () => {
    try {
      const response = await fetch('http://localhost:3000/download-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nasaFireData }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const combinedData = await response.json();
      const blob = new Blob([JSON.stringify(combinedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fire_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Additional Info</h3>
      </div>
      <div className={styles.additional_info}>
        <div>
          <div className={styles.download_data}>
            <p>Download Data</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="14px"
              viewBox="0 -960 960 960"
              width="14px"
              fill="currentColor"
            >
              <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
            <p className={styles.download_info}>
              Download data from the physical device and the hot spots detected
              by NASA satellites.
            </p>
          </div>
          <button onClick={downloadData}>Download Data</button>
        </div>
        <div>
          <p>Report</p>
          <Link href="https://kcshakti.com.np/Forest%20Fire%20Detection%20Project%20Report.pdf" target="_blank">Link to report</Link>
        </div>
        <div>
          <p>Video</p>
          <Link href="https://youtu.be/Z1H2EBt0HEU" target="_blank">Link to youtube video</Link>
        </div>
        <div>
          <p>Source code</p>
          <Link href="https://github.com/shakti-kc/fire-detection" target="_blank">Link to Github(Arduino + Website Code)</Link>
        </div>
      </div>
    </div>
  );
};

export default AdditionalResources;
