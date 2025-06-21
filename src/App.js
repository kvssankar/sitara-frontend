import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Intents from "./pages/Intents";
import KnowledgeBase from "./pages/KnowledgeBase";
import Tools from "./pages/Tools";
import ChatBox from "./pages/Chat";

function App() {
  return (
    <Routes>
      <Route path="/chat" element={<ChatBox />} />
      <Route path="/knowledge-base" element={<KnowledgeBase />} />
      <Route path="/intents" element={<Intents />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
