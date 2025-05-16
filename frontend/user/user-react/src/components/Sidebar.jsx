//사이드바 관리 컴포넌트

import { useState } from "react";
import '../styles/Sidebar.css';

const Sidebar = ({isOpen, openModal, prevChat, createNewChat, selectChat}) => {
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      
      {/* 새 대화 생성 버튼 */}
      <button className="new-conversation" onClick={createNewChat}>새 대화 생성</button>

      {/* 이전 대화 목록 */}
      <h3 style={{ fontSize: "20px", marginTop: "20px", marginBottom: "10px" }}>이전 대화</h3>
      <div className="conversation-container">
        <ul className="conversation-list">
          {prevChat.map((conversation) => (
            <li 
              key={conversation.id} 
              className="conversation-item"
              onClick={() => selectChat(conversation.id)} // 🔹 대화 선택 기능 추가
            >
              {conversation.title} {/* 대화명 출력 */}
            </li>
          ))}
        </ul>
      </div>

      {/* info 모달 버튼 */}
      <div className="info" onClick={openModal}>?</div>
    </div>
  );
}


export default Sidebar;