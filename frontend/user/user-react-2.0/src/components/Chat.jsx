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

  //메세지 전송 및 파일 업로드 처리
  const handleSubmit = () => {
    if (uploadedFile) {
      //파일이 선택된 경우
      if (onFileUpload) {
        onFileUpload(uploadedFile.name); // 백엔드 연동시 수정 필요
      }
      setUploadedFile(null);
      setMessage("");
    } else if (message.trim()) {
      //일반 텍스트 메세지인 경우
      if (onSendMessage) {
        onSendMessage(message.trim()); // 백엔드 연동 시 수정 필요
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
