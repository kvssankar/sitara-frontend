// src/pages/SupportChatPage.js
import React, { useState } from "react";
import {
  AppLayout,
  BreadcrumbGroup,
  ContentLayout,
  Flashbar,
  HelpPanel,
  SideNavigation,
  SpaceBetween,
} from "@cloudscape-design/components";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import messages from "@cloudscape-design/components/i18n/messages/all.en";
import { navLinks } from "../constants";
import { useParams } from "react-router-dom";
import SupportCaseOverview from "../components/SupportCaseOverview";
import SupportChat from "../components/SupportChat";

const LOCALE = "en";

export default function SupportChatPage() {
  const { caseId } = useParams();
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);

  return (
    <I18nProvider locale={LOCALE} messages={[messages]}>
      <AppLayout
        navigationOpen={navigationOpen}
        onNavigationChange={(open) => setNavigationOpen(open.detail.open)}
        onToolsChange={(open) => setToolsOpen(open.detail.open)}
        navigation={
          <SideNavigation
            header={{
              href: "#",
              text: "Support Portal",
            }}
            items={[
              { type: "link", text: "My Tickets", href: "/support/cases" },
              {
                type: "link",
                text: "Create Ticket",
                href: "/support/create-case",
              },
            ]}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: "Support", href: "/support" },
              { text: "My Tickets", href: "/support/cases" },
              { text: "Chat", href: `/support/cases/${caseId}/chat` },
            ]}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel header={<h2>Support Chat Help</h2>}>
            <p>Use this interface to communicate with our support team:</p>
            <ul>
              <li>Type your messages in the text area</li>
              <li>Attach images to help explain your issue</li>
              <li>Press Enter to send, Shift+Enter for new line</li>
              <li>View case details and attachments above</li>
            </ul>
          </HelpPanel>
        }
        content={
          <ContentLayout>
            <SpaceBetween size="l">
              <SupportCaseOverview caseId={caseId} />
              <SupportChat caseId={caseId} />
            </SpaceBetween>
          </ContentLayout>
        }
      />
    </I18nProvider>
  );
}
