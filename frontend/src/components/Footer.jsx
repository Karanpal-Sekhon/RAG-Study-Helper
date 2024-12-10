import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://twitter.com">
          <img src="/path/to/twitter-icon.png" alt="Twitter" />
        </a>
        <a href="https://instagram.com">
          <img src="/path/to/instagram-icon.png" alt="Instagram" />
        </a>
        <a href="https://youtube.com">
          <img src="/path/to/youtube-icon.png" alt="YouTube" />
        </a>
        <a href="https://linkedin.com">
          <img src="/path/to/linkedin-icon.png" alt="LinkedIn" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
