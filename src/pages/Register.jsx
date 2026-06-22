import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import hero from "../assets/hero-register.png";
// import { getUser } from "../services/userService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // resend timer
  const [canResend, setCanResend] = useState(false);

  // ⏱ Timer countdown
  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [step, timer]);

  // Auto focus OTP input
  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    if (!emailRegex.test(userData.email)) {
      toast.error("Invalid email");
      return;
    }

    if (!phoneRegex.test(userData.phone)) {
      toast.error("Invalid phone number");
      return;
    }

    if (!passwordRegex.test(userData.password)) {
      toast.error("Weak password");
      return;
    }

    try {
      setLoading(true);

      // const existingUser = await getUser(userData.username);
      // if (existingUser) {
      //   toast.error("Username already exists");
      //   setLoading(false);
      //   return;
      // }

      const res = await fetch(
        "http://localhost:5000/api/users/register/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "OTP sent successfully");
        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/users/register/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userData.username,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RESEND OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/users/register/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP resent successfully");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <ToastContainer />

      <div className="register-top">
        <img src={hero} alt="FitFuel Nutrition" className="register-hero-img" />
      </div>

      <div className="register-form-container">
        <form className="register-form" onSubmit={handleSendOtp}>
          <h2>Register</h2>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleInputChange}
                required
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={userData.username}
                onChange={handleInputChange}
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={userData.phone}
                onChange={handleInputChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                ref={otpInputRef}
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button type="button" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Register"}
              </button>

              <p>OTP expires in: {timer}s</p>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
              >
                Resend OTP
              </button>
            </>
          )}

          <p className="login-link">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}