import React from "react";
import Chat from "../components/Chat";
import "../styles/MainPage.css";

const MainPage = () => {
  return (
    <div className="main-wrapper">

      <div className="greeting">
        <h2>좋은 하루입니다. 무엇을 도와드릴까요?</h2>
        <p>EV-EDS 시스템으로 기밀 유출 위험 탐지 중입니다. 기밀 유출 걱정 없이 물어보세요!</p>
      </div>
      

      <div className="chat-input-wrapper">
        <Chat />
      </div>
    </div>
  );
};

export default MainPage;
