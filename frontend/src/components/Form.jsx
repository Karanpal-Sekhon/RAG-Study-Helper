import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    if (email) formData.append("email", email);
    if (profileImage) formData.append("profile_image", profileImage);
    try {
      const response = await api.post(route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlternateCase = () => {
    if (method === "login") {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <img src="src/assets/images/logo.png" alt="Logo" className="logo" />
        <h1>{name}</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <input
              className="input-field"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>
          <div className="field">
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          {method === "register" && (
            <>
              <div className="field">
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="field">
                <input
                  className="input-field"
                  type="file"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </div>
            </>
          )}
          <button className="btn" type="submit">
            {name}
          </button>
          <a className="btn-link" onClick={handleAlternateCase}>
            {method === "register" && <>Already have an account? Log in</>}
            {method === "login" && <>Don't have an account? Register here</>}
          </a>
        </form>
      </div>
    </div>
  );
}
export default Form;
