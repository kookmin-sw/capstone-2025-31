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
          조직의 정책에 의거하여 내부 LLM을 통해 답변을 생성하였습니다. <br /><br />
          안녕하세요! 좋은 아침입니다. <br />
          저는 특별한 이름을 가진 건 아니고, 여러분을 돕기 위해 만들어진 AI 어시스턴트(Exaone-3.5)입니다.
        </div>
      </div>
    </div>
  );
};

export default Unsafe;
