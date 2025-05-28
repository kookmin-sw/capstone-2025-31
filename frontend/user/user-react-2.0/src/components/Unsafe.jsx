import React from "react";
import icon from "../assets/LLM.png";
import "../styles/Safe.css";

const Unsafe = () => {
  return (
    <div className="intro-message">
      <div className="icon-text">
        <img src={icon} alt="AI Icon" className="intro-icon" />
        <div className="intro-text">
          [EV-LDS] : 당신의 요청에 기밀 유출 위험이 탐지되어, <br />
          조직의 정책에 의거하여 답변이 거부되었습니니다.
        </div>
      </div>
    </div>
  );
};

export default Unsafe;
