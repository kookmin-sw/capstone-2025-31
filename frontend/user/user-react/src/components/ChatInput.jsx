import { useState } from 'react';
import { FaPaperclip, FaPaperPlane, FaTimes } from 'react-icons/fa';
import '../styles/ChatInput.css';

const ChatInput = ({ onSend }) => {
  const [newMessage, setNewMessage] = useState(''); // 입력된 메시지를 저장하는 상태
  const [files, setFiles] = useState([]); // 여러 파일을 저장할 배열
  const [isDragging, setIsDragging] = useState(false); // 드래그 앤 드롭 상태 감지

  // 메시지 전송 함수
  const handleSend = () => {
    // 메시지나 파일이 있을 경우 전송
    if (newMessage.trim() || files.length > 0) {
      onSend({ message: newMessage, files });
      setNewMessage(''); // 입력 필드 초기화
      setFiles([]); // 파일 목록 초기화
    }
  };

  // 파일 선택 시 실행되는 함수
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // 선택된 파일들을 배열로 변환
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]); // 기존 파일 유지하며 추가
    e.target.value = ''; // 같은 파일을 다시 선택할 경우 이벤트 트리거되도록 초기화
  };

  // 특정 파일을 제거하는 함수
  const handleFileRemove = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // 해당 인덱스의 파일 삭제
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter 입력 시 줄바꿈 추가
        e.preventDefault();
        setNewMessage((prev) => prev + '\n'); 
      } else {
        // Enter만 입력 시 메시지 전송
        e.preventDefault();
        handleSend();
      }
    }
  };

  // 드래그 앤 드롭 기능 - 드래그 중일 때 호출
  const handleDragOver = (e) => {
    e.preventDefault(); // 기본 동작 방지
    setIsDragging(true); // 드래그 상태 활성화
  };

  // 드래그 영역을 벗어날 때 호출
  const handleDragLeave = () => {
    setIsDragging(false); // 드래그 상태 비활성화
  };

  // 파일을 드롭했을 때 호출
  const handleDrop = (e) => {
    e.preventDefault(); // 기본 동작 방지
    setIsDragging(false); // 드래그 상태 비활성화
    const droppedFiles = Array.from(e.dataTransfer.files); // 드롭된 파일 배열로 변환
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]); // 기존 파일 유지하며 추가
  };

  return (
    <div
      className={`chat-input ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver} // 드래그 중일 때
      onDragLeave={handleDragLeave} // 드래그 영역 벗어날 때
      onDrop={handleDrop} // 파일을 드롭할 때
    >

      {/* 첨부된 파일 목록 표시 */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-preview">
              <span className="file-name">{file.name}</span>
              <button className="file-remove" onClick={() => handleFileRemove(index)}>
                <FaTimes size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-row">
        <textarea
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          onKeyPress={handleKeyPress}
          rows={2}
        />
      </div>

      <div className="actions-row">
        <label htmlFor="file-upload" className="file-button">
          <FaPaperclip size={20} />
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
        </label>
        <button className="send-button" onClick={handleSend}>
          <FaPaperPlane size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
