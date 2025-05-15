import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Login'
import Dashboard from './Dashboard'
import FileManagement from './FileManagement'
import PolicyManagement from './PolicyManagement'
import Details from './Details'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/FileManagement" element={<FileManagement />} />
        <Route path="/PolicyManagement" element={<PolicyManagement />} />
        <Route path="/Details" element={<Details />} />
      </Routes>
    </Router>
  )
}

export default App;
