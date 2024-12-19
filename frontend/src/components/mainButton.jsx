import React from "react";
import "../styles/Button.css";

const Button = ({
  children,
  onClick,
  className = "btn",
  type = "button",
  text,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className} // Allow passing classNames for further styling
    >
      {children}
    </button>
  );
};

export default Button;
