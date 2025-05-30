import { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import '../styles/ChatContainer.css';
import { sendMessage } from '../utils/api';
import { sendPairwiseCheck } from '../utils/pairwise';

const ChatContainer = ({ currentChatId, prevChat, addMessageToChat }) => {
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
  
    // 사용자 텍스트 메시지 추가
    if (message) {
      newMessages.push({
        id: Date.now(),
        sender: "user",
        content: message,
        files: [],
      });
    }
  
    // 파일 처리
    for (const file of files) {
      const content = await readFileContent(file);
      const fileMessageId = Date.now() + Math.random();
  
      // 사용자 파일 메시지
      newMessages.push({
        id: fileMessageId,
        sender: "user",
        content: `${file.name}`,
        files: [{ name: file.name, content }],
      });
  
      // 파일 내용에 대한 AI 메시지 (파일 자체에 대한 답변 대신 파일 내용을 그대로 표시)
      newMessages.push({
        id: fileMessageId + 1,
        sender: "ai",
        content: `${content}`,
        files: [],
      });
    }
  
    // 서버에 사용자 텍스트 메시지를 보낸 경우, AI 응답 요청
    if (message) {
      try {
        await sendPairwiseCheck(message);

        const systemMessage = {
          type: "system",
          content: "당신은 유용한 AI 어시스턴트입니다.",
        };
        const userMessage = {
          type: "human",
          content: message,
        };
  
        const aiReply = await sendMessage([systemMessage, userMessage]);
  
        newMessages.push({
          id: Date.now() + Math.random(),
          sender: "ai",
          content: aiReply,
          files: [],
        });

      } catch (err) {
        newMessages.push({
          id: Date.now() + Math.random(),
          sender: "ai",
          content: "서버 요청 중 오류가 발생했습니다.",
          files: [],
        });
      }
    }

  
  
    // 현재 대화에 메시지 추가
    if (currentChatId) {
      newMessages.forEach((msg) => addMessageToChat(currentChatId, msg));
    }
  };
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // 메시지가 변경될 때마다 실행

  useEffect(() => {
    const chat = prevChat.find((chat) => chat.id === currentChatId);
    if (chat) {
      setMessages(chat.messages);
    }
  }, [currentChatId, prevChat]);

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
