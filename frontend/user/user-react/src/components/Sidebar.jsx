//사이드바 관리 컴포넌트

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // 사이드바 아이콘
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // 사이드바 열림(true), 닫힘(false)
  const [prevChat, setPrevChat] = useState([]); // 이전 대화 목록 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // info modal창 상태

  // 새 대화 생성
  const createNewChat = () => {
    const newChat = {
      id: Date.now(), // ID 생성
      // "YYYY.DD.MM 대화N" 형식의 대화명
      title: `${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })} 대화${prevChat.length + 1}`,
    };
    setPrevChat([newChat, ...prevChat]);
  }

  // 사이드바 열기/닫기 토글
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // 모달 열기/닫기 핸들러
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* 사이드바 토글 버튼 */}
      <button onClick={toggleSidebar} className="toggle-button">
          {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
      </button>
      
      {/* 새 대화 생성 버튼 */}
      <button className="new-conversation" onClick={createNewChat}>새 대화 생성</button>

      {/* 이전 대화 목록 */}
      <h3 style={{ fontSize: "20px", marginTop: "20px" }}>이전 대화</h3>
      <div className="conversation-container">
        <ul className="conversation-list">
          {prevChat.map((conversation) => (
            <li key={conversation.id} className="conversation-item">
              {conversation.title} {/* 대화명 출력 */}
            </li>
          ))}
        </ul>
      </div>

      {/* info 모달 버튼 */}
      <div className="info" onClick={openModal}>?</div>
      {/* 모달 창 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>정보</h2>
            <p>조직 : 국민대학교</p>
            <p>관리자 정보 : VIGILANT</p>
            <p>ver 1.0</p>
            <button className="close-button" onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}


export default Sidebar;