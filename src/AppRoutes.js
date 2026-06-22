import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import { logoutUser } from "./services/authService";
import FoodLog from "./pages/FoodLog";

export default function AppRoutes({ user, setUser }) {
  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          user ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/" />
        }
      >
        <Route
          path="dashboard"
          element={
            user ? (
              <Dashboard setUser={setUser} mainlayout={true} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="food-log"
          element={user ? <FoodLog /> : <Navigate to="/" />}
        />
        <Route
          path="set-goals"
          element={user ? <Goals /> : <Navigate to="/" />}
        />
        <Route
          path="settings"
          element={user ? <Settings /> : <Navigate to="/" />}
        />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  );
}
