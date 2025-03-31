//헤더

import React from "react";
import "../styles/Header.css";

const Header = ({ toggleSidebar }) => {
  return (
    <div className="header">
      {/* 사이드바 버튼*/}
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>☰</button>
        <button className="new-chat-button">새 대화</button> 
      </div>
      {/* 타이틀 */}
      <div className="header-title">VIGILANT</div>
      {/* 도움말, 사용자 */}
      <div className="header-right">
        <button className="help">도움말</button> 
        <button className="user-button">👤</button>
      </div>
    </div>
  );
};

export default Header;
