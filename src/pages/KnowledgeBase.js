import React, { useState } from "react";
import {
  AppLayout,
  ContentLayout,
  Flashbar,
  Header,
  HelpPanel,
  SideNavigation,
  SpaceBetween,
} from "@cloudscape-design/components";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import messages from "@cloudscape-design/components/i18n/messages/all.en";
import { navLinks } from "../constants";
import KnowledgeOverview from "../components/KnowledgeOverview";
import KnowledgeFileUpload from "../components/KnowledgeFileUpload";
import KnowledgeFilesTable from "../components/KnowledgeFilesTable";

const LOCALE = "en";

export default function KnowledgeBase() {
  const [user] = useState({
    name: "John Doe",
  });
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger refresh of files table and overview stats
    setRefreshTrigger((prev) => prev + 1);
  };
  //   [
  //     {
  //       type: "info",
  //       dismissible: true,
  //       content: "This is an info flash message.",
  //       id: "message_1",
  //     },
  //   ]
  return (
    <I18nProvider locale={LOCALE} messages={[messages]}>
      <AppLayout
        navigationOpen={navigationOpen}
        onNavigationChange={(open) => {
          console.log("Navigation change", open);
          setNavigationOpen(open.detail.open);
        }}
        onToolsChange={(open) => {
          console.log("Tools change", open);
          setToolsOpen(open.detail.open);
        }}
        navigation={
          <SideNavigation
            header={{
              href: "#",
              text: `Sitara`,
            }}
            items={navLinks}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
        content={
          <ContentLayout
            header={
              <Header
                variant="h1"
                description="Manage your AI-powered knowledge base. Upload documents, view your file library, and organize your content."
              >
                Knowledge Base
              </Header>
            }
          >
            <SpaceBetween size="l">
              <KnowledgeOverview refreshTrigger={refreshTrigger} />
              <KnowledgeFileUpload
                onUploadSuccess={handleUploadSuccess}
                setFlashMessages={setFlashMessages}
              />
              <KnowledgeFilesTable
                refreshTrigger={refreshTrigger}
                setFlashMessages={setFlashMessages}
              />
            </SpaceBetween>
          </ContentLayout>
        }
        // splitPanel={
        //   <SplitPanel header="Test your chatbot">
        //     Split panel content
        //   </SplitPanel>
        // }
      />
    </I18nProvider>
  );
}
