import React, { useState } from "react";
import Login from "./components/Login";
import MainPage from "./pages/MainPage";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <MainPage />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
    // <MainPage ></MainPage>
  );
}

export default App;
