import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FileManagement.css";
import iconDashboard from "./pictures/sidebar/dashboard.png";
import iconDocs from "./pictures/sidebar/docs.png";
import iconRules from "./pictures/sidebar/rules.png";
import iconDetails from "./pictures/sidebar/details.png";
import iconUsers from "./pictures/sidebar/users.png";
import iconLogout from "./pictures/sidebar/logout.png";
import iconOk from "./pictures/file/정상.png";
import iconProcessing from "./pictures/file/처리중.png";

function FileManagement() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState("2025년도_전략기획자료.txt");

  const now = new Date();
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const handleLogout = () => {
    navigate("/");
  };

  const handleSelectFile = (filename) => {
    setSelectedFile(filename);
  };

  const Dashboard = () => {
    navigate("/Dashboard");
  }

  const PolicyManagement = () => {
    navigate("/PolicyManagement");
  }

  const Details = () => {
    navigate("/Details");
  }

  const fileList = [
    "2025년도_전략기획자료.txt",
    "2025년도_핵심전략안무.txt",
    "기밀재무지표.txt",
    "대외비명록.txt",
    "영업팀비밀합보요약.txt",
    "영업팀비밀합보요약.txt",
    "2024년도_핵심연구기록.txt",
    "2025년도_입사자명단.txt",
  ];

  return (
    <div className="dashboard file-management">
      <aside className="sidebar">
        <h1 className="title">EV-DLP</h1>
        <p className="subtitle">내부 정보 유출 위험 감지 보안 플랫폼</p>
        <nav className="menu">
          <button className="sidebar-menu" onClick={Dashboard}>
            <img src={iconDashboard} alt="대시보드" className="menu-icon" /> 대시보드
          </button>
          <button className="sidebar-menu active">
            <img src={iconDocs} alt="기밀 문서 관리" className="menu-icon" /> 기밀 문서 관리
          </button>
          <button className="sidebar-menu" onClick={PolicyManagement}>
            <img src={iconRules} alt="탐지 규칙 관리" className="menu-icon" /> 탐지 규칙 관리
          </button>
          <button className="sidebar-menu" onClick={Details}>
            <img src={iconDetails} alt="탐지 세부 분석" className="menu-icon" /> 탐지 세부 분석
          </button>
        </nav>
        <div className="bottom-menu">
          <button className="sidebar-menu">
            <img src={iconUsers} alt="사용자용" className="menu-icon" /> 사용자용 Web 플랫폼
          </button>
          <button className="sidebar-menu" onClick={handleLogout}>
            <img src={iconLogout} alt="로그아웃" className="menu-icon" /> 관리자 로그아웃
          </button>
        </div>
      </aside>

      <main className="main-content file-management-layout">
        <section className="file-list-section">
          <h1 className="page-title">기밀 문서 관리</h1>
          <p className="subtext">기밀 문서를 간편하게 관리하세요</p>
          <input type="text" className="file-search-input" placeholder="문서 제목을 입력하세요" />
          <ul className="file-list">
            {fileList.map((file, idx) => {
              const isProcessing = file.includes("2025");
              const isSelected = selectedFile === file;
              return (
                <li
                  key={idx}
                  onClick={() => handleSelectFile(file)}
                  className={`file-item ${isSelected ? "selected" : ""}`}
                >
                  <span className={`status-icon-wrapper ${isProcessing ? "processing" : "ok"}`}>
                    <img
                      src={isProcessing ? iconProcessing : iconOk}
                      alt={isProcessing ? "처리 중" : "정상"}
                      className="status-icon"
                    />
                  </span>
                  <span className="file-name-text">{file}</span>
                </li>
              );
            })}
          </ul>
          <button className="upload-button">파일 업로드</button>
        </section>

        <section className="file-detail-section">
          <div className="detail-header">
            <div>
              <h2 className="detail-filename">{selectedFile}</h2>
              <p className="file-timestamp">{formattedTime}</p>
              <div className="file-status-badges">
                <span className="badge green">
                  <img src={iconOk} alt="완료" className="badge-icon" />
                  문서 상태: 업로드 완료
                </span>
                <span className="badge yellow">
                  <img src={iconProcessing} alt="업로드 중" className="badge-icon" />
                  문서 상태: 업로드 중
                </span>
              </div>
            </div>
          </div>
          
          <h3 className="section-title-detail">문서 정보</h3>
          <div className="doc-info-raw">
            <div className="doc-info-col">
              <div className="doc-info-label">글자 수</div>
              <div className="doc-info-value">1,127 자</div>
            </div>
            <div className="doc-info-col">
              <div className="doc-info-label">문장 수</div>
              <div className="doc-info-value">18 문장</div>
            </div>
            <div className="doc-info-col">
              <div className="doc-info-label">청크 수</div>
              <div className="doc-info-value">10,127 개</div>
            </div>
          </div>

            <h3 className="section-title-detail">문서 내용</h3>
            <p className="file-body">
              2025년도 조직의 지속가능한 성장을 도모하고, 급변하는 디지털 환경 속에서 선도적인 경쟁력을 확보하기 위한 중요한 전환점이 될 것이다...
            </p>
        </section>
      </main>
    </div>
  );
}

export default FileManagement;
