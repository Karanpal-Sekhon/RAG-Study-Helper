import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import api from "../api";
import Button from "./mainButton";
import logo from "../assets/images/logo.png";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await api.get("/api/user_info"); // Adjust endpoint to fetch user info
        setUserName(response.data.username);
        setUserImage(response.data.profile_image);
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

  const handleHome = () => {
    navigate("/");
  };

  return (
    <header className="header">
      <a onClick={handleHome}>
        <img src={logo} alt="Logo" className="logo" />
      </a>
      <h1>Master Your Studies: Learn Smarter, Not Harder!</h1>
      <Button onClick={handleLogout}>Logout</Button>
      <img src={userImage} alt="User Profile" className="user-image" />
    </header>
  );
};

export default Header;
