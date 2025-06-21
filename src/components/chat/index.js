// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { forwardRef, useEffect, useRef, useState } from "react";

import Alert from "@cloudscape-design/components/alert";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import PromptInput from "@cloudscape-design/components/prompt-input";

import "./chat.scss";

import Messages from "./Messages";
import { getChat } from "../../api/chat";
import { Box } from "@cloudscape-design/components";
import { nanoid } from "nanoid";
import { useSearchParams } from "react-router-dom";

const FittedContainer = ({ children }) => {
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

const ScrollableContainer = forwardRef(function ScrollableContainer(
  { children },
  ref
) {
  return (
    <div style={{ position: "relative", blockSize: "100%" }}>
      <div
        style={{ position: "absolute", inset: 0, overflowY: "auto" }}
        ref={ref}
      >
        {children}
      </div>
    </div>
  );
});

function getTimestampMinutesAgo(minutesAgo) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);

  return d.toLocaleTimeString();
}

const getLoadingMessage = () => ({
  type: "chat-bubble",
  authorId: "gen-ai",
  content: <Box color="text-status-inactive">Generating a response</Box>,
  timestamp: new Date().toLocaleTimeString(),
  avatarLoading: true,
});

export default function ChatMain() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(() => {
    // Generate session ID on page load
    const existingSessionId = sessionStorage.getItem("sessionId");
    if (existingSessionId) {
      return existingSessionId;
    } else {
      const newSessionId = nanoid();
      sessionStorage.setItem("sessionId", newSessionId);
      return newSessionId;
    }
  });

  const [messages, setMessages] = useState([
    {
      type: "chat-bubble",
      authorId: "gen-ai",
      content: "How can i help you today?",
      timestamp: getTimestampMinutesAgo(0),
    },
  ]);
  const [prompt, setPrompt] = useState(
    searchParams.get("initialPrompt") || ""
  );
  const [isGenAiResponseLoading, setIsGenAiResponseLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom to show the new/latest message
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  }, [messages[messages.length - 1].content]);

  const onPromptSend = async ({ detail: { value } }) => {
    if (!value || value.length === 0 || isGenAiResponseLoading) {
      return;
    }

    const newMessage = {
      type: "chat-bubble",
      authorId: "user",
      content: value,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setPrompt("");

    setIsGenAiResponseLoading(true);
    setMessages((prevMessages) => [...prevMessages, getLoadingMessage()]);

    try {
      console.log("sessionId", sessionId);
      const data = await getChat(sessionId, value);
      const text = data.text;
      const newMessage = {
        type: "chat-bubble",
        authorId: "gen-ai",
        content: text,
        timestamp: getTimestampMinutesAgo(0),
      };
      setMessages((prevMessages) => {
        prevMessages.splice(prevMessages.length - 1, 1, newMessage);
        return prevMessages;
      });
      setIsGenAiResponseLoading(false);
    } catch (e) {
      console.error(e);
      const newMessage = {
        type: "alert",
        header: "Error",
        content: "An error occurred, please try again",
      };
      setMessages((prevMessages) => {
        prevMessages.splice(prevMessages.length - 1, 1, newMessage);
        return prevMessages;
      });
      setIsGenAiResponseLoading(false);
    }

    // const newMessage = {
    //   type: "chat-bubble",
    //   authorId: "user-jane-doe",
    //   content: value,
    //   timestamp: new Date().toLocaleTimeString(),
    // };

    // setMessages((prevMessages) => [...prevMessages, newMessage]);
    // setPrompt("");
  };

  return (
    <div className={`chat-container`} style={{ marginTop: "1rem" }}>
      {showAlert && (
        <Alert
          dismissible
          statusIconAriaLabel="Info"
          onDismiss={() => setShowAlert(false)}
        >
          This demo showcases the potential to build a chatbot which can handle
          any number of complex use-cases.
          <div>
            1. Currently the chatbot lacks small talk, but it can be built to
            have the ability to answer questions based on its knowledge base.
          </div>
          <div>
            2. Knowledge base is not only limited to docs but can work with sql
            database as well. The system can be build to query and get info from
            db based on what user is asking.
          </div>
          <div>
            3. The first message will be slow(5 secs) since the backend is
            serverless. Please be patient.
          </div>
        </Alert>
      )}

      <FittedContainer>
        <Container
          header={<Header variant="h3">Generative AI chat</Header>}
          fitHeight
          disableContentPaddings
          footer={
            <FormField
              stretch
              constraintText={
                <>
                  Use of this service is subject to the{" "}
                  <Link href="#" external variant="primary" fontSize="inherit">
                    AWS Responsible AI Policy
                  </Link>
                  .
                </>
              }
            >
              {/* During loading, action button looks enabled but functionality is disabled. */}
              {/* This will be fixed once prompt input receives an update where the action button can receive focus while being disabled. */}
              {/* In the meantime, changing aria labels of prompt input and action button to reflect this. */}
              <PromptInput
                onChange={({ detail }) => setPrompt(detail.value)}
                onAction={onPromptSend}
                value={prompt}
                actionButtonAriaLabel={
                  isGenAiResponseLoading
                    ? "Send message button - suppressed"
                    : "Send message"
                }
                actionButtonIconName="send"
                ariaLabel={
                  isGenAiResponseLoading
                    ? "Prompt input - suppressed"
                    : "Prompt input"
                }
                placeholder="Ask a question"
                autoFocus
              />
            </FormField>
          }
        >
          <ScrollableContainer ref={messagesContainerRef}>
            <Messages messages={messages} />
          </ScrollableContainer>
        </Container>
      </FittedContainer>
    </div>
  );
}
