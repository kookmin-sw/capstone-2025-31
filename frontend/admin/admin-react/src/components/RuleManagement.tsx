import React, { useState } from 'react';
import './RuleManagement.css';

interface Rule {
  id: string;
  name: string;
  timestamp: string;
  status: 'active' | 'inactive';
  appliedCount: number;
  totalCount: number;
}

const RuleManagement: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [rules] = useState<Rule[]>([
    {
      id: '1',
      name: '보안 등급 1 관계 규칙.rules',
      timestamp: '2025-04-12 12:38:54',
      status: 'active',
      appliedCount: 1204,
      totalCount: 48
    },
    // 더미 데이터 추가 가능
  ]);

  return (
    <div className="rule-management-layout">
      {/* 좌측 규칙 목록 */}
      <div className="rule-list-section">
        <h1 className="page-title">탐지 규칙 관리</h1>
        <p className="subtext">탐지 규칙을 세워 조직의 보안을 확보해보세요</p>
        
        <input
          type="text"
          className="rule-search-input"
          placeholder="규칙 검색"
        />

        <ul className="rule-list">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className={`rule-item ${selectedRule?.id === rule.id ? 'selected' : ''}`}
              onClick={() => setSelectedRule(rule)}
            >
              <div className={`status-icon-wrapper ${rule.status === 'active' ? 'ok' : 'processing'}`}>
                <img
                  src={rule.status === 'active' ? '/icons/check.svg' : '/icons/processing.svg'}
                  alt="상태"
                  className="status-icon"
                />
              </div>
              <span className="rule-name-text">{rule.name}</span>
            </li>
          ))}
        </ul>

        <button className="create-rule-button">선택 규칙 삭제</button>
        <button className="create-rule-button">신규 규칙 생성</button>
      </div>

      {/* 우측 상세 정보 */}
      {selectedRule && (
        <div className="rule-detail-section">
          <h2 className="detail-filename">{selectedRule.name}</h2>
          <p className="rule-timestamp">{selectedRule.timestamp}</p>

          <div className="rule-status-badges">
            <span className="badge green">
              <img src="/icons/check.svg" alt="" className="badge-icon" />
              규칙 상태: 적용 중
            </span>
          </div>

          <div className="rule-stats">
            <h3 className="section-title">적용 정보</h3>
            <p className="rule-meta">처리 시간: {selectedRule.totalCount}h</p>
            <p className="rule-meta">처리된 문서: {selectedRule.appliedCount}</p>
          </div>

          <div className="rule-content">
            <h3 className="section-title">규칙 세부 내용</h3>
            <div className="rule-body">
              {/* 규칙 세부 내용 표시 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleManagement; 