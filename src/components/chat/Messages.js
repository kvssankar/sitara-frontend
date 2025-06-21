// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from "react";

import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Alert from "@cloudscape-design/components/alert";
import Avatar from "@cloudscape-design/chat-components/avatar";
import LiveRegion from "@cloudscape-design/components/live-region";

function ChatBubbleAvatar({ type, name, initials, loading }) {
  if (type === "gen-ai") {
    return (
      <Avatar
        color="gen-ai"
        iconName="gen-ai"
        tooltipText={name}
        ariaLabel={name}
        loading={loading}
      />
    );
  }

  return <Avatar initials={initials} tooltipText={name} ariaLabel={name} />;
}

const AUTHORS = {
  "user": { type: "user", name: "User text", initials: "U" },
  "gen-ai": { type: "gen-ai", name: "Generative AI assistant" },
};

export default function Messages({ messages = [] }) {
  const latestMessage = messages[messages.length - 1];

  return (
    <div className="messages" role="region" aria-label="Chat">
      <LiveRegion hidden={true} assertive={latestMessage?.type === "alert"}>
        {latestMessage?.type === "alert" && latestMessage.header}
        {latestMessage?.content}
      </LiveRegion>

      {messages.map((message, index) => {
        if (message.type === "alert") {
          return (
            <Alert
              key={"error-alert" + index}
              header={message.header}
              type="error"
              statusIconAriaLabel="Error"
              data-testid={"error-alert" + index}
            >
              {message.content}
            </Alert>
          );
        }

        const author = AUTHORS[message.authorId];

        return (
          <ChatBubble
            key={message.authorId + message.timestamp}
            avatar={
              <ChatBubbleAvatar {...author} loading={message.avatarLoading} />
            }
            ariaLabel={`${author.name} at ${message.timestamp}`}
            type={author.type === "gen-ai" ? "incoming" : "outgoing"}
            hideAvatar={message.hideAvatar}
            actions={message.actions}
          >
            {message.content}
          </ChatBubble>
        );
      })}
    </div>
  );
}
