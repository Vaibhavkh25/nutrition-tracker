// 
import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { fetchNutritionData } from "../services/nutritionService";
import { getSessionUser, addFoodLog, getUser } from "../services/userService";
import { CATEGORIES, CATEGORY_LIST } from "../constants/appConstants";
import "../styles/LogFood.css";

const getLocalDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// ✅ AUTO PARSE INPUT (e.g. "2 roti", "150g rice")
const parseFoodInput = (input) => {
  const regex =
    /^(\d+(\.\d+)?)\s*(g|grams|kg|cup|cups|piece|pieces)?\s*(.*)$/i;

  const match = input.trim().match(regex);

  if (!match) {
    return {
      quantity: 1,
      unit: "pieces",
      foodName: input,
    };
  }

  let quantity = parseFloat(match[1]);
  let unit = match[3]?.toLowerCase() || "pieces";
  let foodName = match[4];

  if (unit === "g" || unit === "grams") unit = "grams";
  if (unit === "kg") {
    quantity = quantity * 1000;
    unit = "grams";
  }
  if (unit === "cup" || unit === "cups") unit = "cups";
  if (unit === "piece" || unit === "pieces") unit = "pieces";

  return {
    quantity,
    unit,
    foodName: foodName || input,
  };
};

// ✅ FOOD WEIGHT MAP (grams per unit)
const FOOD_WEIGHT_MAP = {
  roti: 40,
  chapati: 40,
  rice: 150,
  banana: 120,
  egg: 50,
  milk: 240,
  bread: 25,
};

// ✅ SMART CALCULATION
const calculateNutrition = (food, quantity, unit, foodName) => {
  let grams = 0;
  const lowerName = foodName.toLowerCase();

  // find closest match
  const matchedKey = Object.keys(FOOD_WEIGHT_MAP).find((key) =>
    lowerName.includes(key)
  );

  if (unit === "grams") {
    grams = quantity;
  } else if (unit === "cups") {
    const weight = FOOD_WEIGHT_MAP[matchedKey] || 240;
    grams = quantity * weight;
  } else {
    const weight = FOOD_WEIGHT_MAP[matchedKey] || 50;
    grams = quantity * weight;
  }

  const factor = grams / 100;

  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor),
    carbs: Math.round(food.carbs * factor),
    fat: Math.round(food.fat * factor),
  };
};

const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodItems, setFoodItems] = useState([]);
  const [foodEntry, setFoodEntry] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pieces");

  const username = getSessionUser();

  // ================= LOAD FOOD =================
  const loadFoodDataForDate = useCallback(
    async (date) => {
      if (!username) return;

      try {
        const user = await getUser(username);

        if (!user || !user.foodLogs) {
          setFoodItems([]);
          return;
        }

        const selectedDateKey = getLocalDate(date);

        const filtered = user.foodLogs.filter((item) => {
          const itemDate = getLocalDate(item.date);
          return itemDate === selectedDateKey;
        });

        setFoodItems(filtered);
      } catch (err) {
        console.error("Load error:", err);
      }
    },
    [username]
  );

  useEffect(() => {
    loadFoodDataForDate(selectedDate);
  }, [selectedDate, loadFoodDataForDate]);

  // ================= SEARCH FOOD =================
  const handleSearchFood = async () => {
    if (!foodEntry.trim()) {
      alert("Enter food name!");
      return;
    }

    const parsed = parseFoodInput(foodEntry);

    setQuantity(parsed.quantity);
    setUnit(parsed.unit);

    try {
      const food = await fetchNutritionData(parsed.foodName);

      if (!food) {
        alert("Food not found");
        return;
      }

      setSearchResult({
        name:
          food.name ||
          food.food_name ||
          food.title ||
          food.label ||
          "Unknown Food",
        calories: Math.round(food.calories || 0),
        protein: Math.round(food.protein || 0),
        carbs: Math.round(food.carbs || 0),
        fat: Math.round(food.fat || 0),
      });

      setShowCategoryPicker(true);
    } catch (error) {
      console.error(error);
      alert("Error fetching food data.");
    }
  };

  // ================= ADD FOOD =================
  const handleAddToCategory = async (category) => {
    if (!searchResult || !username) return;

    const nutrition = calculateNutrition(
      searchResult,
      quantity,
      unit,
      searchResult.name
    );

    const newItem = {
      name: searchResult.name,
      quantity,
      unit,
      ...nutrition,
      category,
      date: getLocalDate(selectedDate),
    };

    try {
      const saved = await addFoodLog(username, newItem);

      if (!saved) {
        alert("Failed to save food log!");
        return;
      }

      await loadFoodDataForDate(selectedDate);
      window.dispatchEvent(new Event("foodUpdated"));

      // RESET
      setShowCategoryPicker(false);
      setSearchResult(null);
      setFoodEntry("");
      setQuantity(1);
      setUnit("pieces");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving food.");
    }
  };

  // ================= DELETE =================
  const handleDeleteItem = (id) => {
    setFoodItems(foodItems.filter((item) => item._id !== id));
  };

  const toggleCategory = (category) => {
    setExpandedCategory(
      expandedCategory === category ? null : category
    );
  };

  // ================= CALENDAR =================
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateKey = getLocalDate(date);

      const count = foodItems.filter((log) => {
        const logDate = getLocalDate(log.date);
        return logDate === dateKey;
      }).length;

      return count > 0 ? (
        <div className="log-count">{count}</div>
      ) : null;
    }
    return null;
  };

  const previewNutrition =
    searchResult &&
    calculateNutrition(
      searchResult,
      quantity,
      unit,
      searchResult.name
    );

  return (
    <div className="main-content">
      <div className="dashboard-contente">
        <h1>Log Food</h1>

        {/* SEARCH */}
        <div className="food-log-search">
          <input
            type="text"
            placeholder="Try: 2 roti / 150g rice"
            value={foodEntry}
            onChange={(e) => setFoodEntry(e.target.value)}
          />

          <button onClick={handleSearchFood}>
            Search
          </button>
        </div>

        {/* RESULT */}
        {showCategoryPicker && searchResult && (
          <div className="category-picker">
            <p>
              Found: <strong>{searchResult.name}</strong>
            </p>

            <p>
              Quantity: {quantity} {unit}
            </p>

            <div className="macro-details">
              <span>Calories: {previewNutrition.calories}</span>
              <span>Protein: {previewNutrition.protein}g</span>
              <span>Carbs: {previewNutrition.carbs}g</span>
              <span>Fat: {previewNutrition.fat}g</span>
            </div>

            <div className="category-buttons">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    handleAddToCategory(cat)
                  }
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FOOD LIST */}
        <div className="food-log-section">
          {CATEGORY_LIST.map((category) => {
            const items = foodItems.filter(
              (item) => item.category === category
            );

            return (
              items.length > 0 && (
                <div key={category}>
                  <h3 onClick={() => toggleCategory(category)}>
                    {category} ({items.length})
                  </h3>

                  {expandedCategory === category &&
                    items.map((item) => (
                      <div key={item._id} className="food-item">
                        <div>
                          <strong>{item.name}</strong> ({item.quantity} {item.unit})
                        </div>

                        <div className="macro-info">
                          🔥 {item.calories} Cal |
                          💪 {item.protein}g Protein |
                          🍞 {item.carbs}g Carbs |
                          🧈 {item.fat}g Fat
                        </div>

                        <button onClick={() => handleDeleteItem(item._id)}>
                          ❌
                        </button>
                      </div>
                    ))}
                </div>
              )
            );
          })}
        </div>

        {/* CALENDAR */}
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
        />
      </div>
    </div>
  );
};

export default FoodLog;