import styles from "@/styles/rightbar.module.css";
import Subscribe from "./Subscribe";
import MapInfo from "./MapInfo";
const RightBar = () => {
  return (
    <div className={styles.rightbar_container}>
      <Subscribe />
      <MapInfo />
    </div>
  );
};

export default RightBar;
