import { useEffect, useState } from "react";

import AdminApp from "./admin/AdminApp";
import Login from "./login/Login";
import UserApp from "./user/UserApp";

function App() {
  const [accountRole, setAccountRole] = useState(() => {
    return localStorage.getItem("staxAccountRole") || "";
  });

  useEffect(() => {
    if (accountRole) {
      localStorage.setItem("staxAccountRole", accountRole);
    } else {
      localStorage.removeItem("staxAccountRole");
    }
  }, [accountRole]);

  function handleLogin(role) {
    setAccountRole(role);
  }

  function handleLogout() {
    setAccountRole("");
  }

  if (accountRole === "admin") {
    return <AdminApp onLogout={handleLogout} />;
  }

  if (accountRole === "user") {
    return <UserApp onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;