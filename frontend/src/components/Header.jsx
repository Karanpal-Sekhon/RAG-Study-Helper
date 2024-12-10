import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src="src\assets\images\logo.png" alt="Logo" className="logo" />
        <h1>Master Your Studies: Learn Smarter, Not Harder!</h1>
      </div>
      <div className="header-right">
        <button className="btn">Login</button>
        <button className="btn">Sign Up</button>
      </div>
    </header>
  );
};

export default Header;
