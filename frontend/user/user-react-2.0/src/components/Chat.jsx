import React, { useRef, useState } from "react";
import "../styles/Chat.css";

const Chat = ({ onFileUpload, onSendMessage }) => {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setMessage(`${file.name}`);
    }
    fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (uploadedFile) {
      if (onFileUpload) {
        onFileUpload(uploadedFile.name);
      }
      setUploadedFile(null);
      setMessage("");
    } else if (message.trim()) {
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-box">
      <div className="input-area">
        <button className="file-btn" onClick={handleFileClick}>
          <span className="material-symbols-outlined">folder_open</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        <input
          className="text-input"
          type="text"
          placeholder="무엇이든 물어보세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="send-btn" onClick={handleSubmit}>
          <span className="material-symbols-outlined">assistant_navigation</span>
        </button>
      </div>
    </div>
  );
};

export default Chat;
