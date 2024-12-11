import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import api from "../api";

const Header = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await api.get("/api/user_info"); // Adjust endpoint to fetch user info
        setUserName(response.data.username);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserName("Guest"); // Fallback if error occurs
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear tokens or other data
    navigate("/logout"); // Redirect to the logout route
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src="src/assets/images/logo.png" alt="Logo" className="logo" />
        <h1>Master Your Studies: Learn Smarter, Not Harder!</h1>
      </div>
      <div className="header-right">
        <span className="user-name">Welcome, {userName}</span>
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
