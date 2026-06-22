import React, { useState } from "react";
import ProfileSection from "./ProfileSection";
import ResetPasswordSection from "./ResetPasswordSection";
import ForgotPasswordSection from "./ForgotPasswordSection";
import { FaUser, FaLock, FaKey } from "react-icons/fa";
import { motion } from "framer-motion";
import "../styles/Settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "reset":
        return <ResetPasswordSection />;
      case "forgot":
        return <ForgotPasswordSection />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUser /> Profile
        </button>

        <button
          className={activeTab === "reset" ? "active" : ""}
          onClick={() => setActiveTab("reset")}
        >
          <FaLock /> Reset
        </button>

        <button
          className={activeTab === "forgot" ? "active" : ""}
          onClick={() => setActiveTab("forgot")}
        >
          <FaKey /> Forgot
        </button>
      </div>

      {/* Animated Content */}
      <motion.div
        key={activeTab}
        className="settings-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default Settings;