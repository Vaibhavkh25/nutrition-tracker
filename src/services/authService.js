import { SESSION_USER_KEY, USER_DATA_KEY } from "../constants/storageKeys";

export function loginUser(userData, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(SESSION_USER_KEY, userData.username);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

export function logoutUser() {
  localStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function getLoggedInUsername() {
  return (
    localStorage.getItem(SESSION_USER_KEY) ||
    sessionStorage.getItem(SESSION_USER_KEY)
  );
}

export function getLoggedInUser() {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}
