
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  declare global {
    interface Window {
      timer?: number | NodeJS.Timeout | null;
    }
  }

  // Ensure a global timer variable exists for legacy custom scripts that rely on it (e.g., updateTime).
  if (typeof window.timer === "undefined") {
    window.timer = null;
  }

  createRoot(document.getElementById("root")!).render(<App />);
  