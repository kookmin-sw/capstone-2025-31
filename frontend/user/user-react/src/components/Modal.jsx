import '../styles/Modal.css';

const Modal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null; // 모달이 닫혀 있으면 렌더링 안 함

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>정보</h2>
        <p>조직 : 국민대학교</p>
        <p>관리자 정보 : VIGILANT</p>
        <p>ver 1.0</p>
        <button className="close-button" onClick={closeModal}>닫기</button>
      </div>
    </div>
  );
};

export default Modal;
