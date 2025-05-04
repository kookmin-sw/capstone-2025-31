import React, { useState } from "react";
import Chat from "../components/Chat";
import Checking from "../components/Checking";
import "../styles/MainPage.css";

const MainPage = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleFileUpload = async (fileName) => {
    setFileUploaded(true);
    setMessages([
      { sender: "user", text: "안녕? 좋은 아침이야" },
      { sender: "user", text: `[파일] : ${fileName}` },
    ]);
  
    // 검사 결과 메시지 (임시 검사 중 상태)
    setMessages((prev) => [
      ...prev,
      {
        sender: "system",
        component: <Checking label={0} time="2025.04.29 21:48:32" />, // 검사 중
      },
    ]);
  
    try {
      // 검사 시뮬레이션 (2초 후 결과 반환)
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          const randomLabel = Math.random() > 0.5 ? 1 : 2; // label: 1 (안전), 2 (위험)
          resolve({ label: randomLabel, time: "2025.04.29 21:48:48" });
        }, 2000)
      );
  
      // 메시지 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        const last = newMessages.pop();
  
        if (last.sender === "system" && last.component) {
          newMessages.push({
            sender: "system",
            component: <Checking label={response.label} time={response.time} />,
          });
        }
  
        // 검사 결과에 따른 AI 응답
        if (response.label === 1) {
          // 안전
          newMessages.push({
            sender: "ai",
            text: `안녕하세요! 좋은 아침입니다.
                  저는 특별한 이름을 가진 건 아니고, 여러분을 돕기 위해 만들어진 AI 어시스턴트(ChatGPT)입니다.
                  
                  필요하시면 저를 부르기 편하게 "챗봇" 또는 "비서", 혹은 원하는 이름으로 불러주셔도 괜찮습니다.
                  원하시면 별명을 하나 정해주실래요?
                  
                  어떤 이름으로 불렀으면 좋겠나요?`,
          });
        } else {
          // 위험
          newMessages.push({
            sender: "ai",
            text: `[EV-LDS] : 당신의 요청에 기밀 유출 위험이 탐지되어, 조직의 정책에 의거하여 내부 LLM을 통해 답변을 생성하였습니다.
                    안녕하세요! 좋은 아침입니다.
                    저는 특별한 이름을 가진 건 아니고, 여러분을 돕기 위해 만들어진 AI 어시스턴트(Exaone-3.5)입니다.`,
          });
        }
  
        return newMessages;
      });
    } catch (error) {
      console.error("검사 실패:", error);
    }
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
            <div
              key={index}
              className={`chat-message ${msg.sender || (msg.component ? "ai" : "")}`}
            >
              {msg.component ? msg.component : msg.text}
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
