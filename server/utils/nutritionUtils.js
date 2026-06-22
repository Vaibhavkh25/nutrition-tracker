export const calculateBMR = (user) => {
  if (user.gender === "male") {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    return 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }
};

const activityMultiplier = {
  low: 1.2,
  moderate: 1.55,
  high: 1.9,
};

export const calculateTDEE = (bmr, activityLevel) => {
  return bmr * activityMultiplier[activityLevel];
};

export const adjustCalories = (tdee, goalType) => {
  if (goalType === "lose") return tdee - 500;
  if (goalType === "gain") return tdee + 500;
  return tdee;
};

export const calculateMacros = (calories) => {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
};