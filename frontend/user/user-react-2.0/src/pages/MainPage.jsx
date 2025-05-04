import React, { useState } from "react";
import Chat from "../components/Chat";
import "../styles/MainPage.css";

const MainPage = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleFileUpload = (fileName) => {
    setFileUploaded(true);
    setMessages([
      { sender: "user", text: "안녕? 좋은 아침이야" },
      { sender: "user", text: `[파일] : ${fileName}` },
    ]);
  };

  const handleSendMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
  };

  return (
    <div className={`main-wrapper ${fileUploaded ? "chat-mode" : ""}`}>
      {!fileUploaded && (
        <div className="greeting">
          <h2>좋은 하루입니다. 무엇을 도와드릴까요?</h2>
          <p>EV-EDS 시스템으로 기밀 유출 위험 탐지 중입니다. 기밀 유출 걱정 없이 물어보세요!</p>
        </div>
      )}

      {fileUploaded && (
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
      )}

      <div className="chat-input-wrapper">
        <Chat
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default MainPage;
