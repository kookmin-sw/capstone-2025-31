import React, { useState, useEffect, useRef } from "react";
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
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null); // 파일 input 초기화

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  const fetchUploadedDocuments = async () => {
    try{
      const res = await fetch("http://localhost:1234/files");
      const files = await res.json();
      const newDocs = files.map((file) => ({
        name: file,
        status: "green",
        favorite: false,
      }));
      setDocuments(newDocs);
    } 
    catch(err){
      console.error("문서 목록 가져오기 실패:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try{
      await fetch("http://localhost:1234/upload", {
        method: "POST",
        body: formData
      });
      fetchUploadedDocuments();
    } 
    catch(err) {
      console.error("업로드 실패:", err);
    } 
    finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelect = (name) => setSelectedDocument(name);

  const toggleFavorite = (docName) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.name === docName ? { ...doc, favorite: !doc.favorite } : doc
      )
    );
  };

  const filteredDocuments = documents.sort((a, b) =>
    a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1
  );

  const toggleDetail = (idx) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const handleDelete = async () => {
    if (!selectedDocument || selectedDocument === "문서를 선택하세요") {
      alert('삭제할 문서를 선택하세요.');
      return;
    }

    if (!window.confirm(`${selectedDocument} 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await fetch("http://localhost:1234/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: selectedDocument }),
      });
      alert("파일이 삭제되었습니다.");
      setSelectedDocument("문서를 선택하세요");
      fetchUploadedDocuments();
    } catch (err) {
      console.error("파일 삭제 실패:", err);
      alert("파일 삭제에 실패했습니다.");
    } finally {
      // ✅ 삭제 후에도 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    const end = parseISO(endDate);
    const start = subDays(end, 6);
    const days = eachDayOfInterval({ start, end });

    const data = days.map((date) => ({
      label: format(date, "MM/dd"),
      value: Math.floor(Math.random() * 100),
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

      <div className="bottom-row">
        <div className="left-section">
          <h2>기업 문서 관리</h2>
          <input 
            type="file" 
            accept=".pdf,.docx,.txt" 
            onChange={handleFileUpload} 
            ref={fileInputRef} // 🔥 ref 연결
          />
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

        <div className="right-section">
          <div className="section-header">
            <h3>문서 상세 사항</h3>
            <button className="delete-button" onClick={handleDelete}>문서 삭제</button>
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
              <div>업로드 완료</div>
            </div>
          </div>

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
