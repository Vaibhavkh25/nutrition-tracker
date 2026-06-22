import axios from "axios";

const CALORIE_NINJAS_API_KEY =
  process.env.REACT_APP_CALORIE_NINJAS_API_KEY;

const API_URL = "https://api.calorieninjas.com/v1/nutrition";

export const fetchNutritionData = async (query) => {
  try {
    const response = await axios.get(API_URL, {
      params: { query },
      headers: {
        "X-Api-Key": CALORIE_NINJAS_API_KEY,
      },
    });

    const items = response.data.items;

    if (!items || items.length === 0) return null;

    const food = items[0];

    return {
      name: food.name,
      calories: food.calories,
      protein: food.protein_g,
      carbs: food.carbohydrates_total_g,
      fat: food.fat_total_g,
    };
  } catch (error) {
    console.error("CalorieNinjas API Error:", error);
    return null;
  }
};
