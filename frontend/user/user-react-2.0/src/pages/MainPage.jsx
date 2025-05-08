import React, { useState } from "react";
import Chat from "../components/Chat";
import Checking from "../components/Checking";
import Safe from "../components/Safe";
import Unsafe from "../components/Unsafe";
import ReactMarkdown from "react-markdown";
import "../styles/MainPage.css";
import { sendPairwiseCheck, sendMessage } from "../utils/api";

const MainPage = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [messages, setMessages] = useState([]);

  const getTimestamp = () =>
    new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

  const handleFileUpload = async (fileName) => {
    setFileUploaded(true);
    const now = getTimestamp();

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `[파일] : ${fileName}` },
      { sender: "system", component: <Checking label={0} time={now} /> }
    ]);

    try {
      const result = await sendPairwiseCheck(fileName);
      const label = result.flagged ? 2 : 1;
      const time = getTimestamp();

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // remove 검사 중
        updated.push({
          sender: "system",
          component: <Checking label={label} time={time} />
        });
        updated.push({
          sender: "ai",
          component: label === 1 ? <Safe /> : <Unsafe />
        });
        return updated;
      });
    } catch (err) {
      console.error("파일 검사 실패:", err);
    }
  };

  const handleSendMessage = async (text) => {
    setFileUploaded(true);
    const now = getTimestamp();

    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "system", component: <Checking label={0} time={now} /> }
    ]);

    try {
      const checkRes = await sendPairwiseCheck(text);
      const label = checkRes.flagged ? 2 : 1;
      const time = getTimestamp();

      let aiReply = "";
      if (label === 1) {
        aiReply = await sendMessage([
          { type: "system", content: "당신은 유용한 AI 어시스턴트입니다." },
          { type: "human", content: text }
        ]);
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // remove 검사 중
        updated.push({
          sender: "system",
          component: <Checking label={label} time={time} />
        });
        updated.push({
          sender: "ai",
          component: label === 1
            ? <ReactMarkdown>{aiReply}</ReactMarkdown>
            : <Unsafe />
        });
        return updated;
      });
    } catch (err) {
      console.error("메시지 처리 실패:", err);
    }
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
              className={`chat-message ${
                msg.sender === "user"
                  ? "user"
                  : msg.sender === "ai"
                  ? "ai"
                  : "system"
              }`}
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
