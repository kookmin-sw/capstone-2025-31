import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 사이드바 열고 닫는 함수
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default App;
