import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./PolicyManagement.css";
import apply from "./pictures/policy/정상.png";
import not_apply from "./pictures/policy/불가능.png";
import iconDashboard from "./pictures/sidebar/dashboard.png";
import iconDocs from "./pictures/sidebar/docs.png";
import iconRules from "./pictures/sidebar/rules.png";
import iconDetails from "./pictures/sidebar/details.png";
import iconUsers from "./pictures/sidebar/users.png";
import iconLogout from "./pictures/sidebar/logout.png";

function PolicyManagement() {
  const [selectedRuleIdx, setSelectedRuleIdx] = useState(0);
  const [ruleInputs, setRuleInputs] = useState([
    {
      conditionValue: "0.8",
      percentage: "50",
      name: "홍길동",
      contact: "010-1234-5678",
      handlingMethod: "보안 LLM을 통한 답변을 제공하는",
    },
    {}, {}, {}, {}, {}, {}
  ]);

  const ruleList = [
    {
      name: "보안 등급 1 관계 규칙.rules",
      timestamp: "2025-04-12 12:38:54",
      status: "적용 중",
      statusColor: "green",
      applyTime: "48 h",
      detectCount: "1,204",
    },
    {
      name: "보안 등급 2 관계 규칙.rules",
      timestamp: "2025-04-10 09:15:21",
      status: "미적용",
      statusColor: "gray",
      applyTime: "24 h",
      detectCount: "980",
    },
    {
      name: "규칙 이름 3.rules",
      timestamp: "2025-03-28 16:42:10",
      status: "미적용",
      statusColor: "gray",
      applyTime: "12 h",
      detectCount: "350",
    },
    {
      name: "규칙 이름 4.rules",
      timestamp: "2025-03-21 10:11:12",
      status: "미적용",
      statusColor: "gray",
      applyTime: "8 h",
      detectCount: "124",
    },
    {
      name: "규칙 이름 5.rules",
      timestamp: "2025-03-15 13:22:41",
      status: "미적용",
      statusColor: "gray",
      applyTime: "6 h",
      detectCount: "87",
    },
    {
      name: "규칙 이름 6.rules",
      timestamp: "2025-02-28 17:05:10",
      status: "미적용",
      statusColor: "gray",
      applyTime: "3 h",
      detectCount: "34",
    },
    {
      name: "규칙 이름 7.rules",
      timestamp: "2025-02-10 08:45:00",
      status: "미적용",
      statusColor: "gray",
      applyTime: "1 h",
      detectCount: "10",

    },
  ];

  const selectedRule = ruleList[selectedRuleIdx];
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setRuleInputs((prev) => {
      const next = [...prev];
      next[selectedRuleIdx] = {
        ...next[selectedRuleIdx],
        [field]: value,
      };
      return next;
    });
  };

  const handleConditionValueChange = (e) => {
    const value = e.target.value;
    const pattern = /^(0(\.\d*)?|1(\.0+)?)$/;
    if (value === "" || pattern.test(value)) {
      handleInputChange("conditionValue")(e);
    }
  };

  const handlePercentageChange = (e) => {
    const value = e.target.value;
    if (
      value === "" ||
      (/^\d+$/.test(value) &&
        parseInt(value) >= 0 &&
        parseInt(value) <= 100)
    ) {
      handleInputChange("percentage")(e);
    }
  };

  const handleSaveRule = () => {
    alert("규칙이 저장되었습니다.");
  };

  const navigate = useNavigate();

  const Dashboard = () => {
    navigate("/Dashboard");
  };

  const FileManagement = () => {
    navigate("/FileManagement");
  };

  const Details = () => {
    navigate("/Details");
  };

  const input = {
    conditionValue: ruleInputs[selectedRuleIdx]?.conditionValue ?? "0.8",
    percentage: ruleInputs[selectedRuleIdx]?.percentage ?? "50",
    name: ruleInputs[selectedRuleIdx]?.name ?? "admin",
    contact: ruleInputs[selectedRuleIdx]?.contact ?? "010-1234-5678",
    handlingMethod:
      ruleInputs[selectedRuleIdx]?.handlingMethod ??
      "보안 LLM을 통한 답변을 제공하는",
  };

  return (
    <div className="dashboard policy-management">
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
          <button className="sidebar-menu active">
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
          <button className="sidebar-menu" onClick={() => navigate("/")}>
            <img src={iconLogout} alt="로그아웃" className="menu-icon" /> 관리자 로그아웃
          </button>
        </div>
      </aside>

      <main className="main-content-wrapper">
        <div className="page-header">
          <h1 className="page-title">탐지 규칙 관리</h1>
          <p className="page-subtitle">탐지 규칙을 세워 조직의 보안을 확보해보세요</p>
        </div>

        <div className="policy-management-layout">
          <section className="rule-list-section">
            <div className="rule-list-container">
              <h2 className="section-title">규칙 목록</h2>
              <ul className="rule-list">
                {ruleList.map((rule, idx) => (
                  <li key={idx} className="rule-item">
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name="rule"
                        checked={selectedRuleIdx === idx}
                        onChange={() => setSelectedRuleIdx(idx)}
                      />
                      <span className="custom-radio"></span>
                      {rule.name}
                    </label>
                  </li>
                ))}
              </ul>
              <div className="rule-buttons">
                <div className="rule-buttons-top">
                  <button>선택 규칙 삭제</button>
                  <button>신규 규칙 생성</button>
                </div>
                <button className="apply">선택 규칙 적용</button>
              </div>
            </div>
          </section>

          <section className="rule-detail-section">
            <div className="rule-detail-inner">
              <h2 className="detail-title">{selectedRule.name}</h2>
              <p className="rule-timestamp">{selectedRule.timestamp}</p>
              <div
                className={`rule-status-badge-custom ${selectedRule.status === '적용 중' ? 'applied' : 'not-applied'}`}
              >
                <img
                  src={selectedRule.status === '적용 중' ? apply : not_apply}
                  alt={selectedRule.status}
                  className="status-icon"
                />
                규칙 상태 : {selectedRule.status}
              </div>

              <div className="rule-detail-block">
                <h3 className="detail-subtitle">적용 정보</h3>
                <div className="rule-meta-row-horizontal">
                  <div>
                    <div className="rule-meta-label">적용 시간</div>
                    <div className="rule-meta-value">{selectedRule.applyTime}</div>
                  </div>
                  <div>
                    <div className="rule-meta-label">탐지 수</div>
                    <div className="rule-meta-value">{selectedRule.detectCount}</div>
                  </div>
                </div>
              </div>

              <div className="rule-detail-block">
                <h3 className="detail-subtitle">규칙 세부 내용</h3>
                <div className="rule-edit-form">
                  <div className="rule-edit-line">
                    유사도가{" "}
                    <input
                      type="text"
                      value={input.conditionValue}
                      onChange={handleConditionValueChange}
                      className="rule-edit-input"
                      placeholder="0.0~1.0"
                    />
                    이상인 청크의 수가 전체 문서의{" "}
                    <input
                      type="text"
                      value={input.percentage}
                      onChange={handlePercentageChange}
                      className="rule-edit-input"
                      placeholder="0~100"
                    />
                    % 이상이면, 유사한 문서로 탐지한다.
                  </div>
                  <div className="rule-edit-line">
                    담당자 이름(닉네임)은{" "}
                    <input
                      type="text"
                      value={input.name}
                      onChange={handleInputChange("name")}
                      className="rule-edit-input"
                    />
                    이며, 연락처는{" "}
                    <input
                      type="text"
                      value={input.contact}
                      onChange={handleInputChange("contact")}
                      className="rule-edit-input"
                    />
                    이다.
                  </div>
                  <div className="rule-edit-line">
                    기밀 유출 위험이 탐지되면,{" "}
                    <select
                      value={input.handlingMethod}
                      onChange={handleInputChange("handlingMethod")}
                      className="rule-edit-select"
                    >
                      <option value="보안 LLM을 통한 답변을 제공하는">
                        보안 LLM을 통한 답변을 제공하는
                      </option>
                      <option value="사용자에게 경고 문구를 출력하는">
                        사용자에게 경고 문구를 출력하는
                      </option>
                    </select>{" "}
                    방법을 실행한다.
                  </div>
                </div>
              </div>

              <div className="save-button-wrapper">
                <button className="save-button" onClick={handleSaveRule}>
                  저장하기
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PolicyManagement;
