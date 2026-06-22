import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import TitleUpdater from "./components/TitleUpdater";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const sessionUser =
      localStorage.getItem("sessionUser") ||
      sessionStorage.getItem("sessionUser");
    if (sessionUser) setUser(sessionUser);
  }, []);

  return (
    <Router>
      <TitleUpdater />
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
}

export default App;
