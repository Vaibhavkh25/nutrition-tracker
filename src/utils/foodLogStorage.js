export const saveFoodItems = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadFoodItems = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveCategoryTotals = (totals) => {
  localStorage.setItem("categoryTotals", JSON.stringify(totals));
};

export const loadCategoryTotals = () => {
  const data = localStorage.getItem("categoryTotals");
  return data ? JSON.parse(data) : {};
};
