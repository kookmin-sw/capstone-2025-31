import React, { useRef, useState } from "react";
import "../styles/Chat.css";

const Chat = () => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setMessage(file.name); // 파일 이름을 입력창에 표시
    }
  };

  const handleSubmit = () => {
    // if (message || fileName) {
    //   console.log("전송된 메시지:", message);
    //   console.log("전송된 파일:", fileName);
    //   setMessage("");
    //   setFileName("");
    // }
  };

  return (
    <div className="chat-box">
      {/* 입력 영역 */}
      <div className="input-area">
        {/* 파일 첨부 버튼 */}
        <button className="file-btn" onClick={handleFileClick}>
          <span className="material-symbols-outlined">folder_open</span>
        </button>

        {/* 숨겨진 파일 업로드 input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* 사용자 입력창 */}
        <input
          className="text-input"
          type="text"
          placeholder="무엇이든 물어보세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* 전송 버튼 */}
        <button className="send-btn" onClick={handleSubmit}>
          <span className="material-symbols-outlined">assistant_navigation</span>
        </button>
      </div>
    </div>
  );
};

export default Chat;
