import { useEffect, useState } from "react";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import VaultPage from "./screens/VaultPage";
import { navigate } from "./navigation";

const routes = {
  "/login": LoginPage,
  "/register": RegisterPage,
  "/vault": VaultPage,
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    if (!routes[path]) navigate("/login", { replace: true });
  }, [path]);

  const Page = routes[path] || LoginPage;
  return <Page />;
}
