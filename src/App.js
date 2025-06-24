import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Intents from "./pages/Intents";
import KnowledgeBase from "./pages/KnowledgeBase";
import Tools from "./pages/Tools";
import ChatBox from "./pages/Chat";
import CreateSupportCasePage from "./pages/CreateSupportCase";
import SupportCases from "./pages/SupportCases";
import SupportChatPage from "./pages/SupportChatPage";

function App() {
  return (
    <Routes>
      <Route path="/support/cases" element={<SupportCases />} />
      <Route path="/support/cases/:caseId/chat" element={<SupportChatPage />} />
      <Route path="/support/create-case" element={<CreateSupportCasePage />} />
      <Route path="/chat" element={<ChatBox />} />
      <Route path="/knowledge-base" element={<KnowledgeBase />} />
      <Route path="/intents" element={<Intents />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/" element={<Intents />} />
    </Routes>
  );
}

export default App;
