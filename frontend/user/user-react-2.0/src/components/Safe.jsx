import React from "react";
import icon from "../assets/chat-gpt.png";
import "../styles/Safe.css";

const Safe = () => {
  return (
    <div className="intro-message">
      <div className="icon-text">
        <img src={icon} alt="AI Icon" className="intro-icon" />
        <div className="intro-text">
          안녕하세요! 좋은 아침입니다. <br />
          저는 특별한 이름을 가진 건 아니고, 여러분을 돕기 위해 만들어진 AI 어시스턴트(ChatGPT)입니다. <br /><br />
          필요하시면 저를 부르기 편하게 "챗봇" 또는 "비서", 혹은 원하는 이름으로 불러주셔도 괜찮습니다. <br />
          원하시면 별명을 하나 정해주실래요? <br />
          어떤 이름으로 불렀으면 좋겠나요?
        </div>
      </div>
    </div>
  );
};

export default Safe;
