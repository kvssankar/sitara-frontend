// src/components/SupportCorrespondence.js
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  SpaceBetween,
  Box,
  Button,
  Textarea,
  FormField,
  Alert,
  StatusIndicator,
  Header,
  Grid,
} from "@cloudscape-design/components";
import {
  addSupportCaseMessage,
  getSupportCaseMessages,
  getSupportCaseUploadUrl,
} from "../api/support";
import moment from "moment";
import "./SupportCorrespondence.css"; // We'll create this CSS file

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export default function SupportCorrespondence({ caseId }) {
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
      setError("Failed to load correspondence");
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const uploadInfo = await getSupportCaseUploadUrl(
          caseId,
          file.name,
          file.type
        );

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
    if (inputValue.length > 150) return;

    try {
      setLoading(true);
      setUploadingFiles(selectedFiles.length > 0);

      let mediaUrls = [];

      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      const messageData = {
        senderId: localStorage.getItem("userId"),
        senderType: "customer",
        content: inputValue.trim() || "Shared media",
        messageType: mediaUrls.length > 0 ? "media" : "text",
        mediaUrls,
      };

      const newMessage = await addSupportCaseMessage(caseId, messageData);
      setMessages((prev) => [...prev, newMessage]);

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

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = SUPPORTED_FILE_TYPES.join(",");

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        setSelectedFiles(files);
      }
    };

    input.click();
  };

  const getSenderLabel = (senderType) => {
    switch (senderType) {
      case "customer":
        return "Customer";
      case "ai":
        return "AI Agent";
      case "agent":
        return "Agent";
      default:
        return "Unknown";
    }
  };

  const renderMessage = (message, index) => {
    return (
      <div key={message.messageId || index} className="correspondence-row">
        <div className="correspondence-table">
          {/* Left Column - Sender */}
          <div className="correspondence-sender-cell">
            <Box variant="awsui-key-label" color="text-label" fontWeight="bold">
              {getSenderLabel(message.senderType)}
            </Box>
            <Box fontSize="body-s" color="text-status-inactive">
              {moment(message.createdAt).format("ddd MMM DD YYYY")}
            </Box>
            <Box fontSize="body-s" color="text-status-inactive">
              {moment(message.createdAt).format("HH:mm:ss [GMT]ZZ [(]z[)]")}
            </Box>
          </div>

          {/* Right Column - Message Content */}
          <div className="correspondence-content-cell">
            <SpaceBetween size="s">
              <Box>{message.content}</Box>

              {message.mediaUrls && message.mediaUrls.length > 0 && (
                <SpaceBetween size="xs">
                  {message.mediaUrls.map((url, index) => (
                    <Box key={index}>
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        style={{
                          maxWidth: "300px",
                          maxHeight: "200px",
                          borderRadius: "4px",
                          border: "1px solid #e9ebed",
                        }}
                      />
                    </Box>
                  ))}
                </SpaceBetween>
              )}
            </SpaceBetween>
          </div>
        </div>
      </div>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <StatusIndicator type="loading">
        Loading correspondence...
      </StatusIndicator>
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              iconName="refresh"
            >
              Reply
            </Button>
          }
        >
          Correspondence
        </Header>
      }
    >
      <SpaceBetween size="l">
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Messages Area - Table Style */}
        <div className="correspondence-container">
          {messages.length === 0 ? (
            <Box textAlign="center" color="text-status-inactive" padding="l">
              No messages yet. Start the conversation below.
            </Box>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Section */}
        <Container header={<Header variant="h3">Reply</Header>}>
          <SpaceBetween size="m">
            <FormField>
              <Textarea
                value={inputValue}
                onChange={({ detail }) => {
                  if (detail.value.length <= 150) {
                    setInputValue(detail.value);
                  }
                }}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                rows={8}
                disabled={loading}
                invalid={inputValue.length > 150}
              />
              <Box
                fontSize="body-s"
                color={
                  inputValue.length > 150
                    ? "text-status-error"
                    : "text-status-inactive"
                }
                textAlign="right"
                margin={{ top: "xs" }}
              >
                Maximum 150 characters ({150 - inputValue.length} remaining)
                {inputValue.length > 150 && (
                  <Box color="text-status-error">
                    Message exceeds character limit
                  </Box>
                )}
              </Box>
            </FormField>

            {/* Attachments Section */}
            <Box>
              <Box variant="awsui-key-label" margin={{ bottom: "xs" }}>
                Attachments
              </Box>
              <Button
                variant="normal"
                iconName="upload"
                onClick={handleFileSelect}
                disabled={loading}
              >
                Choose files
              </Button>
              <Box
                fontSize="body-s"
                color="text-status-inactive"
                margin={{ top: "xs" }}
              >
                Up to 3 attachments, each less than 5MB.
              </Box>

              {selectedFiles.length > 0 && (
                <Box margin={{ top: "s" }}>
                  <SpaceBetween size="xs">
                    {selectedFiles.map((file, index) => (
                      <Box key={index} display="flex">
                        <Box flex="1">{file.name}</Box>
                        <Button
                          variant="inline-link"
                          onClick={() => {
                            setSelectedFiles((files) =>
                              files.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </SpaceBetween>
                </Box>
              )}
            </Box>

            {/* Submit Buttons */}
            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="normal"
                disabled={loading}
                onClick={() => {
                  setInputValue("");
                  setSelectedFiles([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSendMessage}
                loading={loading || uploadingFiles}
                disabled={
                  (!inputValue.trim() && selectedFiles.length === 0) ||
                  inputValue.length > 150
                }
              >
                Submit
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Container>
  );
}
