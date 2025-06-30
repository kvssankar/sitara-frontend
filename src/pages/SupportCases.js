// src/pages/SupportCases.js
import React, { useState } from "react";
import {
  AppLayout,
  BreadcrumbGroup,
  ContentLayout,
  Flashbar,
  HelpPanel,
  SideNavigation,
} from "@cloudscape-design/components";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import messages from "@cloudscape-design/components/i18n/messages/all.en";
import { navLinks } from "../constants";
import SupportCasesTable from "../components/SupportCasesTable";

const LOCALE = "en";

export default function SupportCases() {
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
              { text: "Support", href: "/support/cases" },
              { text: "My Tickets", href: "/support/cases" },
            ]}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel header={<h2>Support Cases Help</h2>}>
            <p>View and manage your support tickets:</p>
            <ul>
              <li>Click on a case ID to open the chat interface</li>
              <li>Filter cases using the search box</li>
              <li>Track case status and priority levels</li>
              <li>Create new tickets using the Create Case button</li>
            </ul>
          </HelpPanel>
        }
        content={
          <ContentLayout>
            <SupportCasesTable />
          </ContentLayout>
        }
      />
    </I18nProvider>
  );
}
