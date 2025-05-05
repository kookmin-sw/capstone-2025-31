import React, { useState } from "react";
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // ID와 PW 모두 입력된 경우에만 로그인 처리
    if (id.trim() !== "" && pw.trim() !== "") {
      if (onLogin) {
        onLogin();
      }
    } else {
      alert("ID와 비밀번호를 모두 입력해주세요.");
    }
  };

  return (
    <div className="page-container">
      <div className="left-panel">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2 className="title">EV-EDS</h2>
          <p className="subtitle">내부 정보 유출 위험 감지를 위한 생성형 AI 보안 플랫폼</p>
          
          <input
            type="text"
            placeholder="Input ID"
            className="input-field"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Input PW"
            className="input-field"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <button className="login-button" type="submit">로그인</button>

          <p className="small-text">사용자용 Web 플랫폼</p>
        </form>

        <p className="footer-text">
          2025학년도 국민대학교 캡스톤프로젝트 | 31조<br />
          <img src="src/assets/kookmin-logo.jpg" alt="kookmin-logo" className="kookmin-logo" />
        </p>
      </div>

      <div className="right-panel">
        <div className="shield-image">
          <img src="src/assets/login-bg.png" alt="Security Shield" />
        </div>
      </div>
    </div>
  );
};

export default Login;
