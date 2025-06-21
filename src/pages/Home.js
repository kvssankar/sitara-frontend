import React, { useEffect, useState } from "react";
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
import Overview from "../components/IntentsOverview";
import Settings from "../components/Settings";
import ChatMain from "../components/chat";
import { useParams, useSearchParams } from "react-router-dom";

const LOCALE = "en";

export default function Home() {
  const [user, setUser] = useState({
    name: localStorage?.getItem("userName") || "",
  });
  //get query params
  const [searchParams] = useSearchParams();
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
  useEffect(() => {
    const testId = "684d43c3234f6819aae4d80e";
    const app = "Sitara";
    const initialPrompt = searchParams.get("initialPrompt");
    if (testId) {
      localStorage.setItem("userId", testId);
      localStorage.setItem("userName", app);
    }
  }, [searchParams]);
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
        tools={
          <HelpPanel header={<h2>Overview</h2>}>
            You can test the chatbot here. The intents are listed in the Topics
            section. The tools are listed in the Tools section. Try defining new
            intents and tools and test them here. Please read the disclaimer.
          </HelpPanel>
        }
        content={
          <ContentLayout>
            {/* <Container
              header={
                <Header variant="h2" description="Overview">
                  Dashboard
                </Header>
              }
            >
              <div className="contentPlaceholder">
                <Overview />
              </div>
            </Container> */}
            <ChatMain />
          </ContentLayout>
        }
      />
    </I18nProvider>
  );
}
