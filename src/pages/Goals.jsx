import React, { useState, useEffect } from "react";
import "../styles/SetGoals.css";
import {
  getSessionUser,
  saveUserGoals,
  getUserGoals,
} from "../services/userService";

const defaultGoals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const goalTypes = ["Daily", "Weekly", "Monthly"];

const SetGoals = () => {
  const username = getSessionUser();
  const [goalType, setGoalType] = useState("daily");
  const [goalData, setGoalData] = useState(defaultGoals);

  // ✅ Fetch existing goals
  useEffect(() => {
    const fetchGoals = async () => {
      if (username) {
        const goals = await getUserGoals(username);
        if (goals && goals[goalType]) {
          setGoalData(goals[goalType]);
        }
      }
    };

    fetchGoals();
  }, [username, goalType]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setGoalData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // ✅ Save goals
  const handleSubmit = async (e) => {
    e.preventDefault();

    await saveUserGoals(username, goalType, goalData);

    window.dispatchEvent(new Event("goalsUpdated"));
    alert(`${goalType} goals saved!`);
  };

  return (
    <div className="goals-page">
      <h2>Set Your Nutrition Goals</h2>

      <form className="goals-form" onSubmit={handleSubmit}>
        <label>
          Goal Type:
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value)}
          >
            {goalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Calories:
          <input
            type="number"
            name="calories"
            value={goalData.calories}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Protein:
          <input
            type="number"
            name="protein"
            value={goalData.protein}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Carbs:
          <input
            type="number"
            name="carbs"
            value={goalData.carbs}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Fat:
          <input
            type="number"
            name="fat"
            value={goalData.fat}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Save Goals</button>
      </form>
    </div>
  );
};

export default SetGoals;