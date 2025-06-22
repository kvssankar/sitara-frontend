import React, { useState } from "react";
import {
  AppLayout,
  BreadcrumbGroup,
  Container,
  ContentLayout,
  Flashbar,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
  SplitPanel,
} from "@cloudscape-design/components";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import messages from "@cloudscape-design/components/i18n/messages/all.en";
import { navLinks } from "../constants";
import ToolsTable from "../components/ToolsTable";

const LOCALE = "en";

export default function Tools() {
  const [user, setUser] = useState({
    name: "John Doe",
  });
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [flashMessages, setFlashMessages] = useState([]);
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
              text: `Sitaara`,
            }}
            items={navLinks}
          />
        }
        notifications={<Flashbar items={flashMessages} />}
        toolsOpen={toolsOpen}
        tools={
          <HelpPanel header={<h2>Overview</h2>}>
            One can create multiple tools and hand it over to Topics. These
            topics will use the tools as mentioned in the steps
          </HelpPanel>
        }
        content={
          <ContentLayout>
            <Container
              header={
                <Header variant="h2" description="Overview">
                  Tools
                </Header>
              }
            >
              <div className="contentPlaceholder">
                <ToolsTable
                  flashMessages={flashMessages}
                  setFlashMessages={setFlashMessages}
                />
              </div>
            </Container>
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
