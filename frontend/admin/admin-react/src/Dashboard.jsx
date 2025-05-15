import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import statsUpIcon from "./pictures/dashboard/statistics.png";
import detectionIcon from "./pictures/dashboard/detection.png";
import docIcon from "./pictures/dashboard/doc.png";
import statusGreenIcon from "./pictures/dashboard/정상.png";
import statusYellowIcon from "./pictures/dashboard/처리중.png";
import statusRedIcon from "./pictures/dashboard/불가능.png";
import resultSafeIcon from "./pictures/dashboard/정상.png";
import resultDangerIcon from "./pictures/dashboard/위험.png";
import iconDashboard from "./pictures/sidebar/dashboard.png";
import iconDocs from "./pictures/sidebar/docs.png";
import iconRules from "./pictures/sidebar/rules.png";
import iconDetails from "./pictures/sidebar/details.png";
import iconUsers from "./pictures/sidebar/users.png";
import iconLogout from "./pictures/sidebar/logout.png";

function Dashboard() {
  const navigate = useNavigate();

  const now = new Date();
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const handleLogout = () => {
    navigate("/");
  };
  
  const FileManagement = () => {
    navigate("/FileManagement");
  }

  const PolicyManagement = () => {
    navigate("/PolicyManagement");
  }

  const Details = () => {
    navigate("/Details");
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h1 className="title">EV-DLP</h1>
        <p className="subtitle">내부 정보 유출 위험 감지 보안 플랫폼</p>
        <nav className="menu">
          <button className="sidebar-menu active">
            <img src={iconDashboard} alt="대시보드" className="menu-icon" /> 대시보드
          </button>
          <button className="sidebar-menu" onClick={FileManagement}>
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

      <main className="main-content">
        <h1>대시보드</h1>
        <p className="subtext">보안 위험을 한눈에 확인하세요</p>

        <div className="status-bar">
          <div className="status-time">{formattedTime}</div>
          <div className="status-group horizontal">
            <span className="status green">
              <img src={statusGreenIcon} alt="정상" className="status-icon" />
              시스템 상태: 정상
            </span>
            <span className="status yellow">
              <img src={statusYellowIcon} alt="처리 중" className="status-icon" />
              기밀 문서 추가: 처리 중
            </span>
            <span className="status red">
              <img src={statusRedIcon} alt="불가능" className="status-icon" />
              탐지 규칙 설정: 불가능
            </span>
          </div>
        </div>

        <div className="stats-cards">
          <div className="card">
            <img src={statsUpIcon} alt="주간 질의량" className="stat-icon" />
            <div className="card-info">
              <h3>주간 질의량</h3>
              <div className="value-row">
                <span className="value">10,243</span>
                <span className="trend up">▲ 2.5%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <img src={statsUpIcon} alt="일일 질의량" className="stat-icon" />
            <div className="card-info">
              <h3>일일 질의량</h3>
              <div className="value-row">
                <span className="value">1,024</span>
                <span className="trend down">▼ 1.2%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <img src={detectionIcon} alt="탐지 횟수" className="stat-icon" />
            <div className="card-info">
              <h3>기밀 유출 탐지 횟수</h3>
              <span className="value">52,053</span>
            </div>
          </div>

          <div className="card">
            <img src={docIcon} alt="문서 수" className="stat-icon" />
            <div className="card-info">
              <h3>기밀 문서 수</h3>
              <span className="value">103</span>
            </div>
          </div>
        </div>

        <section className="realtime-section">
          <h2>실시간 검사 현황</h2>
          <p className="subtext">실시간으로 보안 위험을 파악해보세요</p>
          <table className="realtime-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>시간</th>
                <th>결과</th>
                <th>유출 파일</th>
                <th>유사도</th>
                <th>사용자 정보</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2025-04-30 10:05:16</td>
                <td>
                  <span className="result-badge green">
                    <img src={resultSafeIcon} alt="안전" className="result-icon" />
                    안전
                  </span>
                </td>
                <td>-</td>
                <td>0%</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>2</td>
                <td>2025-04-30 10:08:38</td>
                <td>
                  <span className="result-badge red">
                    <img src={resultDangerIcon} alt="위험" className="result-icon" />
                    위험
                  </span>
                </td>
                <td>confidential_report.txt</td>
                <td>87%</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>3</td>
                <td>2025-04-30 10:10:31</td>
                <td>
                  <span className="result-badge green">
                    <img src={resultSafeIcon} alt="안전" className="result-icon" />
                    안전
                  </span>
                </td>
                <td>-</td>
                <td>0%</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>4</td>
                <td>2025-04-30 10:12:42</td>
                <td>
                  <span className="result-badge green">
                    <img src={resultSafeIcon} alt="안전" className="result-icon" />
                    안전
                  </span>
                </td>
                <td>-</td>
                <td>0%</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>5</td>
                <td>2025-04-30 10:15:55</td>
                <td>
                  <span className="result-badge green">
                    <img src={resultSafeIcon} alt="안전" className="result-icon" />
                    안전
                  </span>
                </td>
                <td>-</td>
                <td>0%</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>6</td>
                <td>2025-04-30 10:21:38</td>
                <td>
                  <span className="result-badge red">
                    <img src={resultDangerIcon} alt="위험" className="result-icon" />
                    위험
                  </span>
                </td>
                <td>confidential_report.txt</td>
                <td>87%</td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
