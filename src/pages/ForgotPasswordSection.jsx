import React, { useState } from "react";

const ForgotPasswordSection = () => {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState(1);

  // 1️⃣ Send OTP
  const sendOtp = async () => {
    const res = await fetch("http://localhost:5000/api/users/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) setStep(2);
  };

  // 2️⃣ Verify OTP
  const verifyOtp = async () => {
    const res = await fetch("http://localhost:5000/api/users/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, otp }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) setStep(3);
  };

  // 3️⃣ Reset Password
  const resetPassword = async () => {
    const res = await fetch("http://localhost:5000/api/users/reset/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, otp }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setStep(1);
      setUsername("");
      setOtp("");
      setPassword("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Forgot Password</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <input
            type="password"
            placeholder="Enter New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={resetPassword}>Reset Password</button>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordSection;