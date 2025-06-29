// Update src/pages/SupportChatPage.js
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
import { useParams } from "react-router-dom";
import SupportCaseOverview from "../components/SupportCaseOverview";
import SupportCorrespondence from "../components/SupportCorrespondence"; // Changed import

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
              { text: "Correspondence", href: `/support/cases/${caseId}/chat` }, // Updated text
            ]}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel header={<h2>Support Correspondence Help</h2>}>
            <p>Use this interface to communicate with our support team:</p>
            <ul>
              <li>View the conversation history above</li>
              <li>Type your reply in the message area</li>
              <li>Attach files using the "Choose files" button</li>
              <li>Click Submit to send your response</li>
            </ul>
          </HelpPanel>
        }
        content={
          <ContentLayout>
            <SpaceBetween size="l">
              <SupportCaseOverview caseId={caseId} />
              <SupportCorrespondence caseId={caseId} />{" "}
              {/* Changed component */}
            </SpaceBetween>
          </ContentLayout>
        }
      />
    </I18nProvider>
  );
}
