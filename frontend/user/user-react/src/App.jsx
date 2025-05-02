import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import Modal from "./components/Modal";
import "./App.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  // 사이드바 열고 닫는 함수
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-content">
        {/* Sidebar에서 모달을 열 수 있도록 openModal 함수 전달 */}
        <Sidebar isOpen={isSidebarOpen} openModal={() => setIsModalOpen(true)} />
        <ChatContainer />
      </div>
      
      {/* Modal 컴포넌트 추가 (isOpen 상태와 닫기 함수 전달) */}
      <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </div>
  );
};

export default App;
