import React from "react";
import '../styles/Login.css'

const Login = () => {
  return (
    <div className="page-container">

      <div className="left-panel">
        <div className="login-box">
          <h2 className="title">EV-EDS</h2>
          <p className="subtitle">내부 정보 유출 위험 감지를 위한 생성형 AI 보안 플랫폼</p>
          <input type="text" placeholder="Input ID" className="input-field" />
          <input type="password" placeholder="Input PW" className="input-field" />
          <button className="login-button">로그인</button>
          <p className="small-text">사용자용 Web 플랫폼</p>
        </div>
        <p className="footer-text">
          2025학년도 국민대학교 캡스톤프로젝트 | 31조<br />
          <img src="src\assets\kookmin-logo.jpg" alt="kookmin-logo" className="kookmin-logo" />
        </p>
      </div>

      <div className="right-panel">
        <div className="shield-image">
          <img src="src\assets\login-bg.png" alt="Security Shield" />
        </div>
      </div>
    </div>
  );
};

export default Login;