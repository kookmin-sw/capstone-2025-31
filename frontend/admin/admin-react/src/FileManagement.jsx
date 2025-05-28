import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFileList, fetchFileDetail } from "./utils/api";
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
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetail, setFileDetail] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    const loadFiles = async () => {
      const files = await fetchFileList();
      setFileList(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    };
    loadFiles();
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (selectedFile) {
        const detail = await fetchFileDetail(selectedFile.id);
        setFileDetail(detail);
      }
    };
    loadDetail();
  }, [selectedFile]);

  const now = new Date();
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const handleLogout = () => navigate("/");
  const handleSelectFile = (file) => setSelectedFile(file);
  const Dashboard = () => navigate("/Dashboard");
  const PolicyManagement = () => navigate("/PolicyManagement");
  const Details = () => navigate("/Details");

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileDelete = async () => {
    if (!selectedFile) return;

    const confirmed = window.confirm(`정말로 "${selectedFile.file_name}" 파일을 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/admin/files/${selectedFile.id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        const files = await fetchFileList();
        setFileList(files);
        setSelectedFile(files[0] || null);
        setFileDetail(null);
      } else {
        alert("삭제 실패: " + (result.error || "서버 오류"));
      }
    } catch (err) {
      console.error("삭제 에러:", err);
      alert("삭제 요청 중 오류 발생");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".txt")) {
      alert("텍스트(.txt) 파일만 업로드할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/admin/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("업로드 완료: " + result.message);
        const files = await fetchFileList();
        setFileList(files);
        setSelectedFile(files[0]);
      } else {
        alert("업로드 실패: " + (result.error || "서버 오류"));
      }
    } catch (err) {
      console.error("업로드 에러:", err);
      alert("업로드 실패");
    }
  };

  

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
              const isSelected = selectedFile?.id === file.id;
              const isProcessing = file.file_name.includes("2025");
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
                  <span className="file-name-text">{file.file_name}</span>
                </li>
              );
            })}
          </ul>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".txt"
            onChange={handleFileChange}
          />
          <button className="upload-button" onClick={handleUploadClick}>파일 업로드</button>
          <button className="delete-button" onClick={handleFileDelete}>파일 삭제</button>
        </section>

        <section className="file-detail-section">
          {fileDetail && (
            <>
              <div className="detail-header">
                <div>
                  <h2 className="detail-filename">{fileDetail.file_name}</h2>
                  <p className="file-timestamp">{formattedTime}</p>
                  <div className="file-status-badges">
                    {fileDetail.status === "done" && (
                      <span className="badge green">
                        <img src={iconOk} alt="완료" className="badge-icon" />
                        문서 상태: 업로드 완료
                      </span>
                    )}
                    {fileDetail.status === "uploading" && (
                      <span className="badge yellow">
                        <img src={iconProcessing} alt="업로드 중" className="badge-icon" />
                        문서 상태: 업로드 중
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="section-title-detail">문서 정보</h3>
              <div className="doc-info-raw">
                <div className="doc-info-col">
                  <div className="doc-info-label">글자 수</div>
                  <div className="doc-info-value">{fileDetail.char_count} 자</div>
                </div>
                <div className="doc-info-col">
                  <div className="doc-info-label">문장 수</div>
                  <div className="doc-info-value">{fileDetail.sentence_count} 문장</div>
                </div>
                <div className="doc-info-col">
                  <div className="doc-info-label">청크 수</div>
                  <div className="doc-info-value">{fileDetail.chunk_count} 개</div>
                </div>
              </div>

              <h3 className="section-title-detail">문서 내용</h3>
              <p className="file-body">{fileDetail.content}</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default FileManagement;
