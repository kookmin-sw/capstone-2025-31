import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import Modal from "./components/Modal";
import "./App.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [prevChat, setPrevChat] = useState([]);  // 이전 대화 목록 상태
  const [currentChatId, setCurrentChatId] = useState(null); // 현재 선택된 대화 ID

  // 사이드바 열고 닫는 함수
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // 새 대화 생성
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })} 대화${prevChat.length + 1}`,
      messages: [],  // 새로운 대화에 메시지 저장할 배열 추가
    };
    
    setPrevChat([newChat, ...prevChat]); // 새 대화 추가
    setCurrentChatId(newChat.id); // 새 대화 선택
  };

  // 대화 선택 함수
  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  // 대화에 메시지 추가
  const addMessageToChat = (chatId, newMessage) => {
    setPrevChat(prevChats => {
      return prevChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, newMessage] } // 해당 대화의 메시지를 업데이트
          : chat
      );
    });
  };

  // 처음 실행 시 "대화1" 자동 생성
  useEffect(() => {
    if (prevChat.length === 0) {
      createNewChat();
    }
  }, []); // 최초 실행 시 한 번만 실행

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-content">
        {/* Sidebar에서 모달을 열 수 있도록 openModal 함수 전달 */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          openModal={() => setIsModalOpen(true)}
          prevChat={prevChat} 
          createNewChat={createNewChat} 
          selectChat={selectChat} />
        <ChatContainer 
          currentChatId={currentChatId}
          prevChat={prevChat}
          addMessageToChat={addMessageToChat} // 메시지 추가 함수 전달
        />
      </div>
      
      {/* Modal 컴포넌트 추가 (isOpen 상태와 닫기 함수 전달) */}
      <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />
    </div>
  );
};

export default App;
