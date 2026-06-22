import React, { useEffect, useState, useCallback } from "react";
import Calendar from "react-calendar";
import { getSessionUser, getUserGoals, getUser } from "../services/userService";
import "../styles/Dashboard.css";
import "react-calendar/dist/Calendar.css";

// ✅ DEFAULT GOALS (fallback)
const defaultGoals = {
  daily: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  weekly: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  monthly: { calories: 0, protein: 0, carbs: 0, fat: 0 },
};

// ✅ DATE FORMAT
// const formatDateKey = (date) => {
//   const d = new Date(date);
//   return d.toISOString().split("T")[0]; // cleaner
// };

const Dashboard = () => {
  const username = getSessionUser();

  const [goalType, setGoalType] = useState("daily");
  const [goals, setGoals] = useState(defaultGoals);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ✅ LOAD GOALS FROM DB
  const loadGoals = useCallback(async () => {
    if (!username) return;

    try {
      const data = await getUserGoals(username);
      setGoals(data || defaultGoals);
    } catch (err) {
      console.error("Goals fetch error:", err);
    }
  }, [username]);

  // ✅ LOAD FOOD DATA
  const loadDashboardData = useCallback(async () => {
    if (!username) return;

    try {
      const user = await getUser(username);

      if (!user || !user.foodLogs) {
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        return;
      }

      // const selectedDateKey = formatDateKey(selectedDate);

      const filtered = user.foodLogs.filter((item) => {
        const itemDate = new Date(item.date)

        return (
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      });

      const total = filtered.reduce(
        (acc, item) => {
          acc.calories += item.calories || 0;
          acc.protein += item.protein || 0;
          acc.carbs += item.carbs || 0;
          acc.fat += item.fat || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );

      setTotals(total);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  }, [username, selectedDate]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    loadGoals();
    loadDashboardData();
  }, [loadGoals, loadDashboardData]);

  // ✅ AUTO REFRESH EVENTS
  useEffect(() => {
    const refresh = () => {
      loadGoals();
      loadDashboardData();
    };

    window.addEventListener("foodUpdated", refresh);
    window.addEventListener("goalsUpdated", refresh); // 🔥 NEW

    return () => {
      window.removeEventListener("foodUpdated", refresh);
      window.removeEventListener("goalsUpdated", refresh);
    };
  }, [loadGoals, loadDashboardData]);

  const currentGoal = goals?.[goalType] || defaultGoals[goalType];

  // ✅ PROGRESS BAR
  const ProgressBar = ({ label, value, max }) => {
    const safeMax = max || 1;
    const percentage = Math.min((value / safeMax) * 100, 100);

    let colorClass = "progress-gray";

    if (value === 0) colorClass = "progress-gray";
    else if (percentage < 25) colorClass = "progress-red";
    else if (percentage < 50) colorClass = "progress-yellow";
    else if (percentage < 75) colorClass = "progress-light-green";
    else if (percentage < 100) colorClass = "progress-green";
    else colorClass = "progress-orange";

    return (
      <div className="progress-bar-wrapper">
        <div className="progress-label">
          <span className="progress-title">{label}</span>
          <span className="progress-value">
            {value} / {max} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-content">
        {/* HEADER */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>

          <div className="goal-type-selector">
            <label>Goal Type</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        <div className="dashboard-grid">
          {/* PROGRESS */}
          <div className="dashboard-card goal-summary">
            <h2>Goal Progress</h2>

            <ProgressBar
              label="Calories"
              value={totals.calories}
              max={currentGoal.calories}
            />
            <ProgressBar
              label="Protein (g)"
              value={totals.protein}
              max={currentGoal.protein}
            />
            <ProgressBar
              label="Carbs (g)"
              value={totals.carbs}
              max={currentGoal.carbs}
            />
            <ProgressBar
              label="Fat (g)"
              value={totals.fat}
              max={currentGoal.fat}
            />
          </div>

          {/* CALENDAR */}
          <div className="dashboard-card calendar-section">
            <h2>Select Date</h2>

            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
