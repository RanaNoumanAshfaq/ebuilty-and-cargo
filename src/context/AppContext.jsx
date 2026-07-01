import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Dark/Light Mode state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Comparison Buckets
  const [compareCars, setCompareCars] = useState([]);
  const [compareTours, setCompareTours] = useState([]);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Auth Operations
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    addToast(`Welcome back, ${userData.name}!`, "success");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    addToast("Logged out successfully.", "info");
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Compare Cars Operations (limit to 3 cars)
  const addToCompareCars = (car) => {
    setCompareCars((prev) => {
      if (prev.some((c) => c._id === car._id || c.name === car.name)) {
        addToast(`${car.name} is already in comparison list.`, "warning");
        return prev;
      }
      if (prev.length >= 3) {
        addToast("You can compare up to 3 cars at a time.", "warning");
        return prev;
      }
      addToast(`Added ${car.name} to comparison.`, "success");
      return [...prev, car];
    });
  };

  const removeFromCompareCars = (carId) => {
    setCompareCars((prev) => prev.filter((c) => c._id !== carId && c.name !== carId));
    addToast("Removed car from comparison.", "info");
  };

  const clearCompareCars = () => {
    setCompareCars([]);
  };

  // Compare Tours Operations (limit to 3 tours)
  const addToCompareTours = (tour) => {
    setCompareTours((prev) => {
      if (prev.some((t) => t._id === tour._id || t.name === tour.name)) {
        addToast(`${tour.name} is already in comparison list.`, "warning");
        return prev;
      }
      if (prev.length >= 3) {
        addToast("You can compare up to 3 packages at a time.", "warning");
        return prev;
      }
      addToast(`Added ${tour.name} to comparison.`, "success");
      return [...prev, tour];
    });
  };

  const removeFromCompareTours = (tourId) => {
    setCompareTours((prev) => prev.filter((t) => t._id !== tourId && t.name !== tourId));
    addToast("Removed tour from comparison.", "info");
  };

  const clearCompareTours = () => {
    setCompareTours([]);
  };

  // Toast Alerts Operations
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        login,
        logout,
        updateProfile,
        compareCars,
        addToCompareCars,
        removeFromCompareCars,
        clearCompareCars,
        compareTours,
        addToCompareTours,
        removeFromCompareTours,
        clearCompareTours,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
