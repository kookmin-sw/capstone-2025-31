import { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import '../styles/ChatContainer.css';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null); // 메시지 끝을 가리킬 ref

  // 파일 내용을 읽는 함수
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // 메시지 전송 및 AI 답변 생성 함수
  const handleSend = async ({ message, files }) => {
    const newMessages = [];
    
    // 사용자 메시지 추가 (텍스트 메시지가 있을 경우)
    if (message) {
      newMessages.push({
        id: Date.now(),
        sender: 'user',
        content: message,
        files: [],
      });
    }

    // 파일 메시지 및 AI 응답 추가
    for (const file of files) {
      const content = await readFileContent(file);
      const fileMessageId = Date.now() + Math.random();
      
      // 사용자 파일 메시지
      newMessages.push({
        id: fileMessageId,
        sender: 'user',
        content: `${file.name}`,
        files: [{ name: file.name, content }],
      });

      // AI의 파일 응답 메시지
      newMessages.push({
        id: fileMessageId + 1,
        sender: 'ai',
        content: `${content}`,
        files: [],
      });
    }

    // AI 응답 메시지 추가 (텍스트 메시지가 있을 경우)
    if (message) {
      newMessages.push({
        id: Date.now() + Math.random(),
        sender: 'ai',
        content: `${message}`,
        files: [],
      });
    }

    // 한 번에 메시지 추가
    setMessages((prevMessages) => [...prevMessages, ...newMessages]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // 메시지가 변경될 때마다 실행

  return (
    <div className={`chat-container ${messages.length === 0 ? "empty" : ""}`}>
      <div className="messages">
        {/* 시작 시 환영합니다 표시 */}
        {/* 대화 시작시 사라짐 */}
        {messages.length === 0 ? (
          <div className="welcome">환영합니다!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        {/* 메시지 끝을 표시하는 div */}
        <div ref={messagesEndRef} />
      </div>
      {/* 메시지 입력창 */}
      <ChatInput onSend={handleSend} />
    </div>
  );
  
};

export default ChatContainer;
