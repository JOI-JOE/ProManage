import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Board from "./pages/Workpaces/_id";
import Board2 from "./pages/Workpaces/_id2";
import Board3 from "./pages/Workpaces/_id3";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/listworkspaceconten" element={<Board2 />} />
        <Route path="/formconten" element={<Board3 />} />
      </Routes>
    </Router>
  );
}

export default App;
