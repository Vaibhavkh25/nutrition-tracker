import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const formatTitle = (path) => {
      if (path === "/") return "Home";
      return path
        .replace("/", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const pageTitle = formatTitle(location.pathname);
    document.title = `Nutrimate | ${pageTitle}`;
  }, [location]);

  return null;
};

export default TitleUpdater;
