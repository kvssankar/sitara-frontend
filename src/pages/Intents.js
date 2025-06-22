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
import IntentsTable from "../components/IntentsTable";

const LOCALE = "en";

export default function Intents() {
  const [user, setUser] = useState({
    name: localStorage?.getItem("userName") || "",
  });
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
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
            One can create any number of topics. Topics are intents for user
            issues. Each topic can be given tools and set of steps to follow.
            Chatbot will adhere to the steps and will no hallucinate.
          </HelpPanel>
        }
        content={
          <ContentLayout>
            <Container
              header={
                <Header variant="h2" description="Overview">
                  Topics
                </Header>
              }
            >
              <div className="contentPlaceholder">
                <IntentsTable setFlashMessages={setFlashMessages} />
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
