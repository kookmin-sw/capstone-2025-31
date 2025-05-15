import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./pictures/login/Signature_KMU1.png";

function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if(id === "admin" && pw === "admin"){
      navigate("/Dashboard");
    } 
    else{
      alert("ID 또는 PW가 올바르지 않습니다.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>EV-DLP</h1>
        <p className="login-subtext">내부 정보 유출 위험 감지를 위한 생성형 AI 보안 플랫폼</p>
        <input
          type="text"
          placeholder="Input ID"
          value={id}
          onChange={(e) => setId(e.target.value)} />
        <input
          type="password"
          placeholder="Input PW"
          value={pw}
          onChange={(e) => setPw(e.target.value)} />
        <button className="login-button" onClick={handleLogin}>로그인</button>
        <p className="platform-info">관리자용 Web 플랫폼</p>
        <footer>
          <p>2025학년도 국민대학교 캡스톤프로젝트 | 31조</p>
          <img src={logo} alt="국민대학교" />
        </footer>
      </div>
      <div className="login-right" />
    </div>
  );
}

export default Login;
