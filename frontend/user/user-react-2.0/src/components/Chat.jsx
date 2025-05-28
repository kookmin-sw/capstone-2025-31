import React, { useRef, useState } from "react";
import "../styles/Chat.css";

const Chat = ({ onFileUpload, onSendMessage }) => {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  //파일 버튼 클릭시 input 클릭
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  // 파일이 선택되면 상태 업데이트 및 input 초기화
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setMessage(`${file.name}`);
    }
    fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (uploadedFile) {
      if (onFileUpload) {
        onFileUpload(uploadedFile.name);
      }
      setUploadedFile(null);
      setMessage("");
    } else if (message.trim()) {
      const text = message.trim();
  
      if (onSendMessage) {
        onSendMessage(text);  
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
