import React, { useState } from "react";
import { getUser, saveUser, getSessionUser } from "../services/userService";
import "../styles/Settings.css";

const ResetPasswordSection = () => {
  const [password, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setPasswords({ ...password, [e.target.name]: e.target.value });
  };

  const handleReset = (e) => {
    e.preventDefault();

    const username = getSessionUser();
    const user = getUser(username);

    if (!user) {
      alert("User data not found or password not set.");
      return;
    }

    if (password.currentPassword !== user.password) {
      alert("Current password is incorrect!");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const updatedUser = { ...user, password: password.newPassword };
    saveUser(username, updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Password updated successfully!");

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="reset-password-section">
      <h3>Reset Password</h3>
      <form className="reset-password-form" onSubmit={handleReset}>
        <input
          type="password"
          placeholder="Current Password"
          name="currentPassword"
          value={password.currentPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          name="newPassword"
          value={password.newPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={password.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordSection;
