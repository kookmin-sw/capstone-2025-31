import React, { useState, useEffect } from "react";
import "./AdminPage.css";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";

function AdminPage() {

  const detectedData = [
    { 시간: "12:00", 문서명: "문서 1" },
    { 시간: "13:00", 문서명: "문서 2" },
    { 시간: "16:00", 문서명: "문서 5" },
    { 시간: "19:00", 문서명: "문서 9" },
    { 시간: "21:00", 문서명: "문서 6" },
  ];

  const detailData = [
    { 날짜: "2025년 6월 20일", 탐지내용: "탐지 내용" },
    { 날짜: "2025년 6월 25일", 탐지내용: "탐지 내용" },
    { 날짜: "2025년 7월 2일", 탐지내용: "탐지 내용" },
    { 날짜: "2025년 7월 10일", 탐지내용: "탐지 내용" },
  ];

  const today = new Date();
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [chartData, setChartData] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState("문서를 선택하세요");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [documents, setDocuments] = useState([
    { name: "예시문서 1.pdf", status: "green", favorite: false },
    { name: "예시문서 2.txt", status: "red", favorite: true }
  ]);

  

  const handleSelect = (name) => setSelectedDocument(name);

  const toggleFavorite = (docName) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.name === docName ? { ...doc, favorite: !doc.favorite } : doc
      )
    );
  };

  const filteredDocuments = documents
    .sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1));

  const toggleDetail = (idx) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  //일자별 탐지 통계(차트)
  useEffect(() => {
    const end = parseISO(endDate);
    const start = subDays(end, 6);

    const days = eachDayOfInterval({ start, end });
    const data = days.map((date) => ({
      label: format(date, "MM/dd"),
      value: Math.floor(Math.random() * 100) // 임시 랜덤 데이터
    }));

    setChartData(data);
  }, [endDate]);

  return (
    <div className="admin-layout">
      <div className="top-row">
        <div className="top-section">
          <h2>일자별 탐지 통계</h2>
          <div className="chart">
            <input
              type="date"
              value={endDate}
              max={format(today, "yyyy-MM-dd")}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#000" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 오늘 탐지된 횟수 */}
        <div className="top-section today-detection-section">
          <h2>오늘 탐지된 횟수</h2>
          <div className="count">5회 검색 탐지</div>
          <div className="date">{format(today, "yyyy년 MM월 dd일")}</div>
          <table>
            <thead>
              <tr>
                <th>시간</th>
                <th>문서 명</th>
              </tr>
            </thead>
            <tbody>
              {detectedData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.시간}</td>
                  <td>{item.문서명}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 기업 문서 관리 */}
      <div className="bottom-row">
        <div className="left-section">
          <h2>기업 문서 관리</h2>
          <input type="file" accept=".pdf,.docx,.txt" />
          <input type="text" placeholder="문서 검색" />
          <ul>
            {filteredDocuments.map((doc) => (
              <li key={doc.name}>
                <button onClick={() => toggleFavorite(doc.name)}>
                  {doc.favorite ? "⭐" : "☆"}
                </button>
                <span className="doc-name" onClick={() => handleSelect(doc.name)}>{doc.name}</span>
                <span>{doc.status === "green" ? "🟢" : doc.status === "red" ? "🔴" : "🟠"}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 문서 상세 사항 */}
        <div className="right-section">
          <div className="section-header">
            <h3>문서 상세 사항</h3>
            <button className="delete-button">문서 삭제</button>
          </div>

          <div className="doc-header">
            <div className="selected-doc">📜 {selectedDocument}</div>
          </div>

          <div className="meta-box">
            <div className="meta-col">
              <div className="label">등록 일자</div>
              <div>2025년 5월 3일</div>
            </div>
            <div className="meta-col">
              <div className="label">탐지 횟수</div>
              <div>3 회 (세부 날짜)</div>
            </div>
            <div className="meta-col">
              <div className="label">최대유사도</div>
              <div>60% (세부 날짜)</div>
            </div>
            <div className="meta-col">
              <div className="label">업로드 상태</div>
              <div>업로드 중</div>
            </div>
          </div>
          
          {/* 탐지 세부 사항 */}
          <div className="title-row">
            <h3>탐지 세부 사항</h3>
            <button className="download-button">문서 다운로드</button>
          </div>
          <p>아래 항목을 클릭하면 해당 세부 사항이 표시됩니다. 다시 클릭하면 숨깁니다.</p>
          {detailData.map((item, idx) => (
            <div key={idx}>
              <button className="accordion-button" onClick={() => toggleDetail(idx)}>
                {item.날짜} | {item.탐지내용}
              </button>
              {expandedIndex === idx && (
                <div className="card">
                  <p>날짜: {item.날짜}</p>
                  <p>탐지 내용: {item.탐지내용}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
