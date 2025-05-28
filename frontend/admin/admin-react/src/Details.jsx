import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDetectionList,
  fetchDetectionDetail,
  fetchStatistics,
} from "./utils/api";
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [stats, setStats] = useState({
    weekly_query_count: 0,
    daily_query_count: 0,
    detected_count: 0,
    confidential_count: 0,
  });

  const navigate = useNavigate();
  const [highlightOffsets, setHighlightOffsets] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const detectionList = await fetchDetectionList();
      setRows(detectionList);
      if (detectionList.length > 0) {
        setSelectedRow(detectionList[0].detected_id);
      }
      const statistics = await fetchStatistics();
      setStats(statistics);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRow != null) {
      const loadDetail = async () => {
        const detailData = await fetchDetectionDetail(selectedRow);
        if (typeof detailData.position === "string") {
          try {
            detailData.position = JSON.parse(detailData.position);
          } catch (err) {
            console.error("position 파싱 오류:", err);
            detailData.position = [];
          }
        }
        setDetail(detailData);
      };
      loadDetail();
    }
  }, [selectedRow]);

  const getCharOffsets = (text, windowSize, slide) => {
    const words = text.replace(/\n/g, " ").split(" ").filter(w => w.length > 1);
    const offsets = [];

    for (let i = 0; i <= words.length - windowSize; i += slide) {
      const chunk = words.slice(i, i + windowSize).join(" ");
      const index = text.indexOf(chunk);
      if (index !== -1) {
        offsets.push([index, index + chunk.length]);
      } else {
        offsets.push(null);
      }
    }
    return offsets;
  };

  const extractQueryPositions = (text, positions) => {
    if (!Array.isArray(positions)) return [];
    const offsets = getCharOffsets(text, 5, 1);
    return positions.map(([q]) => offsets[q-1]).filter(Boolean);
  };

  const extractDocPositions = (text, positions) => {
    if (!Array.isArray(positions)) return [];
    const offsets = getCharOffsets(text, 5, 1);
    return positions.map(([, d]) => offsets[d]).filter(Boolean);
  };

  const mergeHighlightPositions = (positions) => {
    if (!positions || positions.length === 0) return [];
    const sorted = [...positions].sort((a, b) => a[0] - b[0]);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const [prevStart, prevEnd] = merged[merged.length - 1];
      const [currStart, currEnd] = sorted[i];
      if (currStart <= prevEnd) {
        merged[merged.length - 1][1] = Math.max(prevEnd, currEnd);
      } else {
        merged.push([currStart, currEnd]);
      }
    }
    return merged;
  };

  const renderMultipleHighlights = (text, positions) => {
    const merged = mergeHighlightPositions(positions);
    if (!merged.length) return text;
    const result = [];
    let lastIdx = 0;
    merged.forEach(([start, end], i) => {
      if (lastIdx < start) {
        result.push(<span key={"plain-" + i}>{text.slice(lastIdx, start)}</span>);
      }
      result.push(<mark className="highlight-red" key={"hl-" + i}>{text.slice(start, end)}</mark>);
      lastIdx = end;
    });
    if (lastIdx < text.length) {
      result.push(<span key="tail">{text.slice(lastIdx)}</span>);
    }
    return <>{result}</>;
  };

  return (
    <div className="details-page">
      <aside className="sidebar">
        <h1 className="title">EV-DLP</h1>
        <p className="subtitle">내부 정보 유출 위험 감지 보안 플랫폼</p>
        <nav className="menu">
          <button className="sidebar-menu" onClick={() => navigate("/Dashboard")}> <img src={iconDashboard} /> 대시보드 </button>
          <button className="sidebar-menu" onClick={() => navigate("/FileManagement")}> <img src={iconDocs} /> 기밀 문서 관리 </button>
          <button className="sidebar-menu" onClick={() => navigate("/PolicyManagement")}> <img src={iconRules} /> 탐지 규칙 관리 </button>
          <button className="sidebar-menu active"> <img src={iconDetails} /> 탐지 세부 분석 </button>
        </nav>
        <div className="bottom-menu">
          <button className="sidebar-menu"> <img src={iconUsers} /> 사용자용 Web 플랫폼 </button>
          <button className="sidebar-menu" onClick={() => navigate("/")}> <img src={iconLogout} /> 관리자 로그아웃 </button>
        </div>
      </aside>

      <main className="main-content-wrapper">
        <div className="page-header">
          <h1 className="page-title">탐지 세부 분석</h1>
          <p className="page-subtitle">탐지 현황을 바탕으로 세부 로그를 조회하세요</p>
        </div>

        <div className="details-stats-cards">
          <div className="details-card">
            <img src={statsUpIcon} className="details-stat-icon" />
            <div className="details-card-info">
              <h3>주간 질의량</h3>
              <span className="details-value">{stats.weekly_query_count}</span>
            </div>
          </div>
          <div className="details-card">
            <img src={statsUpIcon} className="details-stat-icon" />
            <div className="details-card-info">
              <h3>일일 질의량</h3>
              <span className="details-value">{stats.daily_query_count}</span>
            </div>
          </div>
          <div className="details-card">
            <img src={detectionIcon} className="details-stat-icon" />
            <div className="details-card-info">
              <h3>기밀 유출 탐지 횟수</h3>
              <span className="details-value">{stats.detected_count}</span>
            </div>
          </div>
          <div className="details-card">
            <img src={docIcon} className="details-stat-icon" />
            <div className="details-card-info">
              <h3>기밀 문서 수</h3>
              <span className="details-value">{stats.confidential_count}</span>
            </div>
          </div>
        </div>

        <h2 className="section-title">탐지 세부 정보</h2>
        <div className="details-main-row">
          <section className="detection-details-section">
            <input className="details-search-input" placeholder="탐지 번호를 입력하세요" />
            <div className="detect-list">
              <div className="detect-list-head">
                <div>번호</div><div>시간</div><div>사용자</div>
              </div>
              {rows.map(row => (
                <div key={row.detected_id} className={`detect-list-row${selectedRow === row.detected_id ? " selected-row" : ""}`} onClick={() => setSelectedRow(row.detected_id)}>
                  <div>{row.detected_id}</div>
                  <div>{row.created_at}</div>
                  <div>{row.user}</div>
                </div>
              ))}
            </div>
          </section>

          {detail && (
            <div className="details-content-block merged-block">
              <div className="details-section scrollable-section">
                <div className="details-content-title">사용자 질의 내용</div>
                <div className="details-content-body">
                  {renderMultipleHighlights(detail.query_text, extractQueryPositions(detail.query_text, detail.position))}
                </div>
              </div>
              <div className="details-content-divider" />
              <div className="details-section scrollable-section">
                <div className="details-content-title">{detail.file_name}</div>
                <div className="details-content-body">
                  {renderMultipleHighlights(detail.file_content, extractDocPositions(detail.file_content, detail.position))}
                </div>
              </div>
              <div className="details-content-divider" />
              <div className="details-section section3">
                <div className="details-file-footer-row">
                  <div className="details-file-footer-col">
                    <div className="details-file-footer-label">글자 수</div>
                    <div className="details-file-footer-value">{detail.len}자</div>
                  </div>
                  <div className="details-file-footer-col">
                    <div className="details-file-footer-label">문장 수</div>
                    <div className="details-file-footer-value">{detail.row}문장</div>
                  </div>
                  <div className="details-file-footer-col">
                    <div className="details-file-footer-label">청크 수</div>
                    <div className="details-file-footer-value">{detail.total_count}개</div>
                  </div>
                  <div className="details-file-footer-col">
                    <div className="details-file-footer-label">유사 청크 수</div>
                    <div className="details-file-footer-value">{detail.match_count}개</div>
                  </div>
                  <div className="details-file-footer-col">
                    <div className="details-file-footer-label">전체 유사도</div>
                    <div className="details-file-footer-value footer-red">
                      {typeof detail.similarity === "number" ? detail.similarity.toFixed(1) + "%" : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Details;
