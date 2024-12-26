import React, { useState, useRef, useEffect } from "react";
import "../styles/Chat.css";
import api from "../api";

const Chat = ({ workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [workspace, setWorkspace] = useState({});

  const fetchWorkspace = async () => {
    try {
      const response = await api.get(`api/workspace/${workspaceId}/detail`);
      setWorkspace(response.data);
    } catch (error) {
      console.error("Error fetching workspace detail", error);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "KS", text: inputValue },
      ]);
      setInputValue(""); // Clear input field
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  return (
    <div className="chat">
      <div className="chat-header">
        <h2>{workspace.name}</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === "KS" ? "user-message" : "assistant-message"
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask me anything!"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
