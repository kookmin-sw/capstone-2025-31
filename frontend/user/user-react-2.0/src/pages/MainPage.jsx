import React, { useEffect, useState } from "react";
import Chat from "../components/Chat";
import Checking from "../components/Checking";
import Safe from "../components/Safe";
import Unsafe from "../components/Unsafe";
import "../styles/MainPage.css";

const MainPage = () => {
  const [fileUploaded, setFileUploaded] = useState(false); // 파일 또는 메세지 업로드 여부
  const [messages, setMessages] = useState([]); // 전체 채팅 메세지 리스트
  const [initialized, setInitialized] = useState(false); // 초기 메시지 여부
  const [hideGreeting, setHideGreeting] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);

  useEffect(() => {
    if (fileUploaded) {
      setHideGreeting(true);
      setIsChatMode(true);
    }
  }, [fileUploaded]);


  useEffect(() => {
    if (!initialized) {
      setMessages([
        { sender: "user", text: "안녕? 좋은 아침이야. 너의 이름은 뭐니?" },
      ]);
      setInitialized(true);
    }
  }, [initialized]);

  // 파일 업로드 시
  const handleFileUpload = async (fileName) => {
    setFileUploaded(true);
    // 사용자 메시지 및 검사 중 컴포넌트 표시
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `[파일] : ${fileName}` },
      {
        sender: "system",
        component: <Checking label={0} time="2025.04.29 21:48:32" />, // 검사 중
      },
    ]);

    try {
      // 백엔드 연결 시 수정 필요
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          const randomLabel = Math.random() > 0.5 ? 1 : 2; // 1: 안전 2: 위험 ( 현재는 랜덤 값으로 설정 )
          resolve({ label: randomLabel, time: "2025.04.29 21:48:48" });
        }, 2000)
      );

      // 검사 결과 반영
      setMessages((prev) => {
        const newMessages = [...prev];
        const last = newMessages.pop();

        if (last.sender === "system" && last.component) {
          newMessages.push({
            sender: "system",
            component: <Checking label={response.label} time={response.time} />,
          });
        }

        newMessages.push({
          sender: "ai",
          component: 
            response.label === 1 ? <Safe/> : <Unsafe/>
          
        });

        return newMessages;
      });
    } catch (error) {
      console.error("검사 실패:", error);
    }
  };

  // 사용자가 메세지를 입력했을 때
  const handleSendMessage = async (text) => {
    setFileUploaded(true); // 채팅 모드 진입
    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      {
        sender: "system",
        component: <Checking label={0} time="2025.04.29 21:48:32" />, // 검사 중
      },
    ]);
  
    try {
      // 백엔드에서 수정 필요
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          const randomLabel = Math.random() > 0.5 ? 1 : 2; // 1: 안전, 2: 위험
          resolve({ label: randomLabel, time: "2025.04.29 21:48:48" });
        }, 2000)
      );
  
      setMessages((prev) => {
        const newMessages = [...prev];
        const last = newMessages.pop();
  
        if (last.sender === "system" && last.component) {
          newMessages.push({
            sender: "system",
            component: <Checking label={response.label} time={response.time} />,
          });
        }
  
        newMessages.push({
          sender: "ai",
          component: response.label === 1 ? <Safe /> : <Unsafe />,
        });
  
        return newMessages;
      });
    } catch (error) {
      console.error("유사도 검사 실패:", error);
    }
  };

  return (
    <div className={`main-wrapper ${isChatMode ? "chat-mode" : ""}`}>
      {!hideGreeting && (
        <div className={`greeting ${fileUploaded ? "fade-out" : "fade-in"}`}>
          <h2>좋은 하루입니다. 무엇을 도와드릴까요?</h2>
          <p>EV-EDS 시스템으로 기밀 유출 위험 탐지 중입니다. 기밀 유출 걱정 없이 물어보세요!</p>
        </div>
      )}


      {isChatMode && (
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

      <div className={`chat-input-wrapper ${fileUploaded ? "" : "slide-up"}`}>
        <Chat
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default MainPage;
