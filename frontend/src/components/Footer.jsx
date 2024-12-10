import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://twitter.com">
          <img src="src\assets\images\x.png" alt="Twitter" />
        </a>
        <a href="https://instagram.com">
          <img src="src\assets\images\insta.png" alt="Instagram" />
        </a>
        <a href="https://youtube.com">
          <img src="src\assets\images\youtube.png" alt="YouTube" />
        </a>
        <a href="https://www.linkedin.com/in/karanpal-sekhon/">
          <img src="src\assets\images\linkedin.png" alt="LinkedIn" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
