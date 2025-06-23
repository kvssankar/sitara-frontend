// src/components/SupportChat.js
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  SpaceBetween,
  Box,
  Button,
  Textarea,
  FormField,
  FileUpload,
  Alert,
  StatusIndicator,
} from "@cloudscape-design/components";
import {
  addSupportCaseMessage,
  getSupportCaseMessages,
  getSupportCaseUploadUrl,
} from "../api/support";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import Avatar from "@cloudscape-design/chat-components/avatar";

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function ChatBubbleAvatar({ type, name, loading }) {
  if (type === "ai") {
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

  if (type === "agent") {
    return <Avatar initials="A" tooltipText={name} ariaLabel={name} />;
  }

  return <Avatar initials="U" tooltipText={name} ariaLabel={name} />;
}

export default function SupportChat({ caseId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (caseId) {
      loadMessages();
    }
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getSupportCaseMessages(caseId);
      setMessages(response || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    const uploadedUrls = [];

    for (const file of files) {
      try {
        // Get presigned URL
        const uploadInfo = await getSupportCaseUploadUrl(
          caseId,
          file.name,
          file.type
        );

        // Upload file to S3
        const uploadResponse = await fetch(uploadInfo.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (uploadResponse.ok) {
          uploadedUrls.push(uploadInfo.fileUrl);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }

    return uploadedUrls;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return;

    try {
      setLoading(true);
      setUploadingFiles(selectedFiles.length > 0);

      let mediaUrls = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      // Send message
      const messageData = {
        senderId: localStorage.getItem("userId"),
        senderType: "customer",
        content: inputValue.trim() || "Shared media",
        messageType: mediaUrls.length > 0 ? "media" : "text",
        mediaUrls,
      };

      const newMessage = await addSupportCaseMessage(caseId, messageData);

      // Update messages list
      setMessages((prev) => [...prev, newMessage]);

      // Clear input
      setInputValue("");
      setSelectedFiles([]);
      setError(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message, index) => {
    const authorType =
      message.senderType === "customer"
        ? "user"
        : message.senderType === "ai"
        ? "ai"
        : "agent";

    const authorName =
      message.senderType === "customer"
        ? "You"
        : message.senderType === "ai"
        ? "AI Support"
        : "Support Agent";

    return (
      <ChatBubble
        key={message.messageId || index}
        avatar={
          <ChatBubbleAvatar
            type={authorType}
            name={authorName}
            loading={message.loading}
          />
        }
        ariaLabel={`${authorName} at ${new Date(
          message.createdAt
        ).toLocaleTimeString()}`}
        type={authorType === "user" ? "outgoing" : "incoming"}
      >
        <SpaceBetween size="xs">
          <Box>{message.content}</Box>

          {message.mediaUrls && message.mediaUrls.length > 0 && (
            <SpaceBetween size="xs">
              {message.mediaUrls.map((url, index) => (
                <Box key={index}>
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              ))}
            </SpaceBetween>
          )}

          <Box fontSize="body-s" color="text-status-inactive">
            {new Date(message.createdAt).toLocaleTimeString()}
          </Box>
        </SpaceBetween>
      </ChatBubble>
    );
  };

  if (loading && messages.length === 0) {
    return <StatusIndicator type="loading">Loading chat...</StatusIndicator>;
  }

  return (
    <Container>
      <SpaceBetween size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Messages */}
        <Box style={{ maxHeight: "400px", overflowY: "auto", padding: "1rem" }}>
          <SpaceBetween size="s">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </SpaceBetween>
        </Box>

        {/* Input Area */}
        <Container>
          <SpaceBetween size="s">
            <FormField label="Your message">
              <Textarea
                value={inputValue}
                onChange={({ detail }) => setInputValue(detail.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
                rows={4}
              />
            </FormField>

            <FormField label="Attach images (optional)">
              <FileUpload
                onChange={({ detail }) => setSelectedFiles(detail.value)}
                value={selectedFiles}
                multiple
                accept={SUPPORTED_FILE_TYPES.join(",")}
                showFileLastModified
                showFileSize
                showFileThumbnail
                constraintText="Maximum 5 images, 10MB each. Supported formats: JPEG, PNG, GIF, WebP"
                i18nStrings={{
                  uploadButtonText: (e) => (e ? "Choose files" : "Choose file"),
                  dropzoneText: (e) =>
                    e ? "Drop files to upload" : "Drop file to upload",
                  removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                  limitShowFewer: "Show fewer files",
                  limitShowMore: "Show more files",
                  errorIconAriaLabel: "Error",
                }}
              />
            </FormField>

            <Box textAlign="right">
              <Button
                variant="primary"
                onClick={handleSendMessage}
                loading={loading}
                disabled={!inputValue.trim() && selectedFiles.length === 0}
              >
                {uploadingFiles ? "Uploading..." : "Send Message"}
              </Button>
            </Box>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Container>
  );
}
