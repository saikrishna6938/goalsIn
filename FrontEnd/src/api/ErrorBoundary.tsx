import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ErrorBoundary = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const errorHandler = (event) => {
      if (event instanceof Event) {
        event.preventDefault();
      }
      const iframe = document.querySelector("iframe");
      if (iframe) {
        iframe.style.display = "none";
      }
      console.error(
        "Error caught:",
        event.error || event.reason || event.message
      );
      navigate("/Error/SomethingWentWrong");
    };

    // Capture all types of errors, including syntax errors
    window.addEventListener("error", errorHandler);

    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", errorHandler);

    return () => {
      // Clean up
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", errorHandler);
    };
  }, [navigate]);

  return <>{children}</>;
};

export default ErrorBoundary;
