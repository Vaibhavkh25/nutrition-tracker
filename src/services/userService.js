const BASE_URL = "http://localhost:5000/api/users";

// ================= USER =================

// 🔹 Get single user
export const getUser = async (username) => {
  try {
    const res = await fetch(`${BASE_URL}/profile/${username}`);
    if (!res.ok) throw new Error("User not found");
    return await res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// 🔹 Update user
export const saveUser = async (username, userData) => {
  try {
    const res = await fetch(`${BASE_URL}/profile/${username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

// ================= SESSION =================

// 🔹 Save session
export const setSessionUser = (username, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("SESSION_USER", username);
};

// 🔹 Get session user
export const getSessionUser = () => {
  return (
    localStorage.getItem("SESSION_USER") ||
    sessionStorage.getItem("SESSION_USER")
  );
};

// 🔹 Clear session
export const clearSessionUser = () => {
  localStorage.removeItem("SESSION_USER");
  sessionStorage.removeItem("SESSION_USER");
};

// ================= FOOD LOG =================

// 🔹 Add food log (API-based)
export const addFoodLog = async (username, food) => {
  try {
    const res = await fetch(`${BASE_URL}/food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      // ✅ FIXED PAYLOAD
      body: JSON.stringify({
        username,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: food.category,
        date: food.date,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add food log");
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding food:", error.message);
    return null;
  }
};

// 🔹 Get today's food logs
export const getTodaysFoodLogs = async (username) => {
  const user = await getUser(username);
  if (!user || !user.foodLogs) return [];

  const today = new Date().toISOString().split("T")[0];

  return user.foodLogs.filter((log) => log.date.startsWith(today));
};

// ================= PASSWORD =================

// 🔹 Reset password
export const resetPassword = async (username, password) => {
  try {
    const res = await fetch(`${BASE_URL}/reset/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error resetting password:", error);
  }
};

// ================= REGISTER =================

// 🔹 Register new user
export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (error) {
    console.error("Error registering user:", error);
  }
};

// ✅ Save Goals
export const saveUserGoals = async (username, goalType, goalData) => {
  try {
    const res = await fetch(`${BASE_URL}/save-goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, goalType, goalData }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to save goals");

    return data;
  } catch (error) {
    console.error("Error saving goals:", error);
    return null;
  }
};

// ✅ Get Goals
export const getUserGoals = async (username) => {
  try {
    const res = await fetch(`${BASE_URL}/get-goals/${username}`);

    if (!res.ok) throw new Error("Failed to fetch goals");

    return await res.json();
  } catch (error) {
    console.error("Error fetching goals:", error);
    return {};
  }
};

// ================= LOGIN =================

// 🔹 Login user
export const loginUser = async (username, password) => {
  try {
    console.log("Calling API:", `${BASE_URL}/login`);

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res) {
      throw new Error("No response from server");
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message || "Failed to fetch (server issue)");
    return null;
  }
};