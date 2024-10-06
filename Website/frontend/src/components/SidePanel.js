import React from 'react'
import Settings from './Settings'
import AdditionalResources from './AdditionalResources'
import styles from "@/styles/sidepanel.module.css"
const SidePanel = () => {
  return (
    <div className={styles.side_panel}>
        <Settings />
        <AdditionalResources />
    </div>
  )
}

export default SidePanel