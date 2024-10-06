import Map from "@/components/Map";
import Head from "next/head";
import styles from "@/styles/page.module.css";
import SidePanel from "@/components/SidePanel";
import RightBar from "@/components/RightBar";
export default function Home() {
  return (
    <main className={styles.container}>
      <Head>
        <title>Fire Detection System Map</title>
        <link
          rel="stylesheet"
          href="https://js.arcgis.com/4.22/esri/themes/light/main.css"
        />
      </Head>
      <div className={styles.side_panel}>
        <SidePanel />
      </div>
      <div className={styles.map_container}>
        <Map />
      </div>
      <div className={styles.right_bar_container}>
        <RightBar />
      </div>
    </main>
  );
}
