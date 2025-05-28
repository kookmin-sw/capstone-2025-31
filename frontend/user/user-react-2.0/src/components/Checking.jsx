import React from "react";
import "../styles/Checking.css";

const Checking = ({ label, time }) => {
  let result = "검사 중";
  let bgColor = "#999";
  let icon = "hourglass_empty";
  let color = "#ffffff";

  //안전
  if (label === 1) { 
    result = "안전함";
    bgColor = "#d8f7cc";
    icon = "verified_user";
    color = "#000000";
  } 
  //위험
  else if (label === 2) {
    result = "안전하지 않음";
    bgColor = "#f7ccd2";
    icon = "warning";
    color = "#000000";
  }

  return (
    <div className="checking-container" style={{ backgroundColor: bgColor }}>
      <span className="material-symbols-outlined icon" style={{ color }}>
        {icon}
      </span>
      <div className="result-text" style= {{color: color}}>
        <div>EV-LDS 검사 결과: {result}</div>
        <div className="timestamp">{time}</div>
      </div>
    </div>
  );
};

export default Checking;
