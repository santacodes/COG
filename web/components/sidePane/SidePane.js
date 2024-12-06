// components/SidePane/SidePane.js
"use client"
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './SidePane.module.css';

// Dynamic imports for tabs
const Tab1 = dynamic(() => import('../Tabs/Tab1'));
const Tab2 = dynamic(() => import('../Tabs/Tab2'));
const Tab3 = dynamic(() => import('../Tabs/Tab3'));

const SidePane = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
        <div className={styles.sidePane}>
            {/* Navigation Section */}
            <div className={styles.navContainer}>
                <nav className={styles.sidePaneNav}>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'tab1' ? styles.active : ''}`}
                        onClick={() => setActiveTab('tab1')}
                    >
                        <img src="/images/icons8-layers-30.png" alt="Layers" />
                    </button>
                    <button
                        className={`${styles.navBtn} ${activeTab === 'tab3' ? styles.active : ''}`}
                        onClick={() => setActiveTab('tab3')}
                    >
                        <img src="/images/icons8-cube-50.png" alt="Cube" />
                    </button>
                </nav>
            </div>

            {/* Tab Content Section */}
            <div className={styles.tabContent}>
                {activeTab === 'tab1' && <Tab1 />}
                {activeTab === 'tab3' && <Tab3 />}
            </div>
        </div>
    );
};

export default SidePane;
