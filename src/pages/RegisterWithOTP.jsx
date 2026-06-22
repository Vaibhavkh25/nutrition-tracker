import React, { useState } from "react";

const RegisterWithOTP = () => {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 1️⃣ Send OTP
  const sendOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/register/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) setStep(2);

    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  };

  // 2️⃣ Verify OTP & Register
  const verifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/register/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          otp: form.otp,
        }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setStep(1);
        setForm({ username: "", email: "", password: "", otp: "" });
      }

    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register with OTP</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <button onClick={sendOtp} style={styles.button}>
            Send OTP
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <input
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            style={styles.input}
          />

          <button onClick={verifyOtp} style={styles.button}>
            Verify & Register
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default RegisterWithOTP;