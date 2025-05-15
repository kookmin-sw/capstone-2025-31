import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Details.css";
import statsUpIcon from "./pictures/dashboard/statistics.png";
import detectionIcon from "./pictures/dashboard/detection.png";
import docIcon from "./pictures/dashboard/doc.png";
import iconDashboard from "./pictures/sidebar/dashboard.png";
import iconDocs from "./pictures/sidebar/docs.png";
import iconRules from "./pictures/sidebar/rules.png";
import iconDetails from "./pictures/sidebar/details.png";
import iconUsers from "./pictures/sidebar/users.png";
import iconLogout from "./pictures/sidebar/logout.png";

function Details() {
    const [selectedRow, setSelectedRow] = useState(1);

    const rows = [
    { id: 1, time: "2025-04-30 14:15:49", user: "Admin" },
    { id: 2, time: "2025-04-30 14:16:30", user: "Admin" },
    { id: 3, time: "2025-04-30 14:18:23", user: "Admin" },
    ];

    const navigate = useNavigate()  ;

    const handleLogout = () => {
    navigate("/");
    };

    const Dashboard = () => {
        navigate("/Dashboard");
    }

    const FileManagement = () => {
        navigate("/FileManagement");
    }
    const PolicyManagement = () => {
        navigate("/PolicyManagement");
    }

  return (
    <div className="details-page">
      <aside className="sidebar">
        <h1 className="title">EV-DLP</h1>
        <p className="subtitle">내부 정보 유출 위험 감지 보안 플랫폼</p>
        <nav className="menu">
          <button className="sidebar-menu" onClick={Dashboard}>
              <img src={iconDashboard} alt="대시보드" className="menu-icon" /> 대시보드
          </button>
          <button className="sidebar-menu" onClick={FileManagement}>
              <img src={iconDocs} alt="기밀 문서 관리" className="menu-icon" /> 기밀 문서 관리
          </button>
          <button className="sidebar-menu" onClick={PolicyManagement}>
              <img src={iconRules} alt="탐지 규칙 관리" className="menu-icon" /> 탐지 규칙 관리
          </button>
          <button className="sidebar-menu active">
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

      <main className="main-content-wrapper">
        <div className="page-header">
          <h1 className="page-title">탐지 세부 분석</h1>
          <p className="page-subtitle">탐지 현황을 바탕으로 세부 로그를 조회하세요</p>
        </div>

        <div className="details-stats-cards">
          <div className="details-card">
            <img src={statsUpIcon} alt="주간 질의량" className="details-stat-icon" />
            <div className="details-card-info">
              <h3>주간 질의량</h3>
              <div className="details-value-row">
                <span className="details-value">10,243</span>
                <span className="details-trend up">▲ 2.5%</span>
              </div>
            </div>
          </div>
          <div className="details-card">
            <img src={statsUpIcon} alt="일일 질의량" className="details-stat-icon" />
            <div className="details-card-info">
              <h3>일일 질의량</h3>
              <div className="details-value-row">
                <span className="details-value">1,024</span>
                <span className="details-trend down">▼ 1.2%</span>
              </div>
            </div>
          </div>
          <div className="details-card">
            <img src={detectionIcon} alt="탐지 횟수" className="details-stat-icon" />
            <div className="details-card-info">
              <h3>기밀 유출 탐지 횟수</h3>
              <span className="details-value">52,053</span>
            </div>
          </div>
          <div className="details-card">
            <img src={docIcon} alt="문서 수" className="details-stat-icon" />
            <div className="details-card-info">
              <h3>기밀 문서 수</h3>
              <span className="details-value">103</span>
            </div>
          </div>
        </div>

        <h2 className="section-title">탐지 세부 정보</h2>
        <div className="details-main-row">
          <section className="detection-details-section">
            <input
              className="details-search-input"
              placeholder="탐지 번호를 입력하세요"
            />
              <div className="detect-list">
                <div className="detect-list-head">
                  <div>번호</div>
                  <div>시간</div>
                  <div>사용자</div>
                </div>
                {rows.map(row => (
                <div
                  key={row.id}
                  className={`detect-list-row${selectedRow === row.id ? " selected-row" : ""}`}
                  onClick={() => setSelectedRow(row.id)}>
                  <div>{row.id}</div>
                  <div>{row.time}</div>
                  <div>{row.user}</div>
              </div>
            ))}
          </div>
          </section>

          <div className="details-content-block merged-block">
            <div className="details-section scrollable-section">
              <div className="details-content-title">사용자 질의 내용</div>
              <div className="details-content-body highlight">
                <span className="highlight-red">
                  2025년부터는 조직의 지속가능한 성장을 도모하고, 급변하는 디지털 환경 속에서 선도적인 경쟁력을 확보하기 위한 중요한 전환점이 될 것이다.
                </span>
                이에 따라 본 전략기획안은 ‘혁신을 통한 가치 창출’이라는 핵심 기조 아래, 내부 역량 강화와 외부 협력 확대를 아우르는 다차원적 전략을 포함하고 있다.<br />
                첫째, 기술 중심의 미래 대응력을 확보하기 위해 인공지능, 보안, 클라우드 등 차세대 기술에 대한 선제적 투자와 인재 육성을 병행한다. 특히, 연구개발(R&D) 예산을 전년 대비 25% 확대 편성하여 핵심 기술 내재화와 원천기술 확보에 집중한다. 이를 통해 기술 차입도를 높이고, 외부 의존도를 낮추어 기술 리스크를 사전에 차단할 것이다.<br />
                둘째, 내부 경영 효율화를 통해 운영비용을 절감하고, 프로세스 혁신을 가속화한다. 전사적 디지털 전환(Enterprise DX) 추진을 통해 업무 자동화 수준을 높이고, 데이터 기반 의사결정 체계를 정착시킬 예정이다. 이와 함께 전사 통합 성과관리 시스템을 고도화하여 KPI 중심의 책임 경영 문화를 확산한다.<br />
                셋째, 고객 중심의 시장 확대 전략을 수립하여 안정적인 수익 기반을 다진다. 기존 고객사와의 파트너십을 심화하고, 공공 및 민간 신규 수요 창출을 위한 맞춤형 솔루션 제안을 강화한다. 또한 글로벌 시장 진출을 위해 해외 지사 설립을 추진하고, 전략적 제휴를 통해 현지화 전략을 적극 도모한다.
              </div>
            </div>
            <div className="details-content-divider" />
            <div className="details-section scrollable-section">
              <div className="details-content-title">2025년도_전략기획자료.txt</div>
              <div className="details-content-body highlight">
                <span className="highlight-red">
                  2025년부터는 조직의 지속가능한 성장을 도모하고, 급변하는 디지털 환경 속에서 선도적인 경쟁력을 확보하기 위한 중요한 전환점이 될 것이다.
                </span>
                이에 따라 본 전략기획안은 ‘혁신을 통한 가치 창출’이라는 핵심 기조 아래, 내부 역량 강화와 외부 협력 확대를 아우르는 다차원적 전략을 포함하고 있다.<br />
                첫째, 기술 중심의 미래 대응력을 확보하기 위해 인공지능, 보안, 클라우드 등 차세대 기술에 대한 선제적 투자와 인재 육성을 병행한다. 특히, 연구개발(R&D) 예산을 전년 대비 25% 확대 편성하여 핵심 기술 내재화와 원천기술 확보에 집중한다. 이를 통해 기술 차입도를 높이고, 외부 의존도를 낮추어 기술 리스크를 사전에 차단할 것이다.<br />
                둘째, 내부 경영 효율화를 통해 운영비용을 절감하고, 프로세스 혁신을 가속화한다. 전사적 디지털 전환(Enterprise DX) 추진을 통해 업무 자동화 수준을 높이고, 데이터 기반 의사결정 체계를 정착시킬 예정이다. 이와 함께 전사 통합 성과관리 시스템을 고도화하여 KPI 중심의 책임 경영 문화를 확산한다.<br />
                셋째, 고객 중심의 시장 확대 전략을 수립하여 안정적인 수익 기반을 다진다. 기존 고객사와의 파트너십을 심화하고, 공공 및 민간 신규 수요 창출을 위한 맞춤형 솔루션 제안을 강화한다. 또한 글로벌 시장 진출을 위해 해외 지사 설립을 추진하고, 전략적 제휴를 통해 현지화 전략을 적극 도모한다.
              </div>
            </div>
            <div className="details-content-divider" />
            <div className="details-section section3">
              <div className="details-file-footer-row">
                <div className="details-file-footer-col">
                  <div className="details-file-footer-label">글자 수</div>
                  <div className="details-file-footer-value">1,127자</div>
                </div>
                <div className="details-file-footer-col">
                  <div className="details-file-footer-label">문장 수</div>
                  <div className="details-file-footer-value">18문장</div>
                </div>
                <div className="details-file-footer-col">
                  <div className="details-file-footer-label">청크 수</div>
                  <div className="details-file-footer-value">10,127개</div>
                </div>
                <div className="details-file-footer-col">
                  <div className="details-file-footer-label">유사 청크 수</div>
                  <div className="details-file-footer-value">10,127개</div>
                </div>
                <div className="details-file-footer-col">
                  <div className="details-file-footer-label">전체 유사도</div>
                  <div className="details-file-footer-value footer-red">100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Details;
