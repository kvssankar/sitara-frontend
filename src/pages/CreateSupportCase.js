// src/pages/CreateSupportCase.js

import React, { useState } from "react";
import {
  AppLayout,
  BreadcrumbGroup,
  Flashbar,
  SideNavigation,
  HelpPanel,
} from "@cloudscape-design/components";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import messages from "@cloudscape-design/components/i18n/messages/all.en";
import CreateSupportCase from "../components/CreateSupportCase";

const LOCALE = "en";

export default function CreateSupportCasePage() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [flashMessages, setFlashMessages] = useState([]);

  return (
    <I18nProvider locale={LOCALE} messages={[messages]}>
      <AppLayout
        navigationOpen={navigationOpen}
        onNavigationChange={(open) => {
          setNavigationOpen(open.detail.open);
        }}
        onToolsChange={(open) => {
          setToolsOpen(open.detail.open);
        }}
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
              { text: "Create Ticket", href: "/support/create-case" },
            ]}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel header={<h2>Support Ticket Help</h2>}>
            <p>To create an effective support ticket:</p>
            <ul>
              <li>Provide a clear description of your issue</li>
              <li>Include detailed steps to reproduce the problem</li>
              <li>Select the most relevant category when available</li>
            </ul>
            <p>
              Our support team typically responds within 24 hours for standard
              issues and within 4 hours for urgent matters.
            </p>
          </HelpPanel>
        }
        content={<CreateSupportCase />}
      />
    </I18nProvider>
  );
}
