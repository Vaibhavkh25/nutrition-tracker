import React, { useState, useEffect } from "react";
import { getSessionUser } from "../services/userService";
import axios from "axios";
import "../styles/Settings.css";
import defaultProfile from "../assets/default-profile.png";

const ProfileSection = () => {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
  });

  const [editing, setEditing] = useState(false);

  // ✅ Image states
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // ================= FETCH USER =================
  useEffect(() => {
    const username = getSessionUser();

    if (username) {
      axios
        .get(`http://localhost:5000/api/users/profile/${username}`)
        .then((res) => {
          const userData = res.data;

          setUser({
            ...userData,
            profileImage: userData.profileImage
              ? userData.profileImage.startsWith("http")
                ? userData.profileImage
                : `http://localhost:5000/uploads/${userData.profileImage}`
              : "",
          });

          setForm({
            username: userData.username,
            email: userData.email || "",
            phone: userData.phone || "",
            age: userData.age || "",
            gender: userData.gender || "",
            height: userData.height || "",
            weight: userData.weight || "",
            activityLevel: userData.activityLevel || "",
            goal: userData.goalType || "",
          });
        })
        .catch((err) => {
          console.error("❌ Error fetching user:", err);
        });
    }
  }, []);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SAVE PROFILE =================
const handleSave = () => {
  const username = getSessionUser(); // ✅ IMPORTANT FIX

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!emailRegex.test(form.email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!phoneRegex.test(form.phone)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  axios
    .put(`http://localhost:5000/api/users/profile/${username}`, {
      email: form.email,
      phone: form.phone,
      age: form.age,
      gender: form.gender,
      height: form.height,
      weight: form.weight,
      activityLevel: form.activityLevel,
      goalType: form.goal,
    })
    .then((res) => {
      const updatedUser = res.data;

      setUser({
        ...updatedUser,
        profileImage: updatedUser.profileImage
          ? updatedUser.profileImage.startsWith("http")
            ? updatedUser.profileImage
            : `http://localhost:5000/uploads/${updatedUser.profileImage}`
          : "",
      });

      setEditing(false);
      alert("Profile updated successfully ✅");
    })
    .catch((err) => {
      console.error("❌ Update error:", err);
    });
};

  // ================= IMAGE HANDLERS =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file)); // ✅ preview
    }
  };

 const handleImageUpload = async () => {
  if (!selectedFile) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("profileImage", selectedFile); // ✅ must match multer key

  try {
    const res = await fetch(
      `http://localhost:5000/api/users/profile-image/${user.username}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setUser((prev) => ({
      ...prev,
      profileImage: data.profileImage,
    }));

    setPreview(null);
    setSelectedFile(null);
    alert("Profile image updated successfully ✅");
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    alert("Failed to upload image");
  }
};
  return (
    <div className="profile-section">
      <h2>Profile</h2>

      {user ? (
        <>
          {/* ✅ PROFILE IMAGE */}
          <div className="profile-image-section">
            <div className="image-wrapper">
              <img
                src={
                  preview
                    ? preview
                    : user?.profileImage
                      ?user.profileImage
                      : defaultProfile
                }
                alt="Profile"
                className="profile-img"
              />

              {editing && (
                <label className="upload-icon">
                  ✏️
                  <input type="file" onChange={handleFileChange} hidden />
                </label>
              )}
            </div>

            {editing && (
              <button className="upload-btn" onClick={handleImageUpload}>
                Upload
              </button>
            )}
          </div>

          {/* Username */}
          <div className="profile-field">
            <label>Username:</label>
            <span>{form.username}</span>
          </div>

          {/* Email */}
          <div className="profile-field">
            <label>Email:</label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            ) : (
              <span>{form.email || "Not set"}</span>
            )}
          </div>

          {/* Phone */}
          <div className="profile-field">
            <label>Mobile:</label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            ) : (
              <span>{form.phone || "Not set"}</span>
            )}
          </div>

          {/* Age */}
          <div className="profile-field">
            <label>Age:</label>
            {editing ? (
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
              />
            ) : (
              <span>{form.age || "Not set"}</span>
            )}
          </div>

          {/* Gender */}
          <div className="profile-field">
            <label>Gender:</label>
            {editing ? (
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <span>{form.gender || "Not set"}</span>
            )}
          </div>

          {/* Height */}
          <div className="profile-field">
            <label>Height (cm):</label>
            {editing ? (
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
              />
            ) : (
              <span>{form.height || "Not set"}</span>
            )}
          </div>

          {/* Weight */}
          <div className="profile-field">
            <label>Weight (kg):</label>
            {editing ? (
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
              />
            ) : (
              <span>{form.weight || "Not set"}</span>
            )}
          </div>

          {/* Activity */}
          <div className="profile-field">
            <label>Activity Level:</label>
            {editing ? (
              <select
                name="activityLevel"
                value={form.activityLevel}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span>{form.activityLevel || "Not set"}</span>
            )}
          </div>

          {/* Goal */}
          <div className="profile-field">
            <label>Goal:</label>
            {editing ? (
              <select name="goal" value={form.goal} onChange={handleChange}>
                <option value="">Select</option>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain Weight</option>
              </select>
            ) : (
              <span>
                {form.goal === "lose" && "Lose Weight"}
                {form.goal === "gain" && "Gain Weight"}
                {form.goal === "maintain" && "Maintain"}
                {!form.goal && "Not set"}
              </span>
            )}
          </div>

          {/* Buttons */}
          {editing ? (
            <button className="save-btn" onClick={handleSave}>
              Save
            </button>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default ProfileSection;
