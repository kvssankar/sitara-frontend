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
  Cards,
  Badge,
} from "@cloudscape-design/components";
import {
  addSupportCaseMessage,
  getSupportCaseMessages,
  getSupportCaseUploadUrl,
  getSupportCase,
  updateSupportCase,
} from "../api/support";
import moment from "moment";
import "./SupportCorrespondence.css";

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

  // Intent selection state
  const [caseData, setCaseData] = useState(null);
  const [pendingIntents, setPendingIntents] = useState([]);
  const [showIntentSelection, setShowIntentSelection] = useState(false);
  const [isSelectingIntent, setIsSelectingIntent] = useState(false);

  useEffect(() => {
    if (caseId) {
      loadCaseData();
      loadMessages();
    }
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCaseData = async () => {
    try {
      const response = await getSupportCase(caseId);
      setCaseData(response);

      // Check if we need to show intent selection
      const needsIntentSelection =
        response?.pendingIntents &&
        response.pendingIntents.length > 0 &&
        !response.intentId;

      if (needsIntentSelection) {
        setPendingIntents(response.pendingIntents);
        setShowIntentSelection(true);
      } else {
        setShowIntentSelection(false);
        setPendingIntents([]);
      }
    } catch (error) {
      console.error("Error loading case data:", error);
      setError("Failed to load case information");
    }
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

  const handleIntentSelect = async (intent) => {
    setIsSelectingIntent(true);
    setError(null);

    try {
      // Add message to local state immediately
      const localMessage = {
        messageId: Date.now().toString(), // Temporary ID
        senderId: "684d43c3234f6819aae4d80e",
        senderType: "customer",
        content: `Intent selected: ${intent.intent}`,
        messageType: "text",
        mediaUrls: [],
        createdAt: new Date().toISOString(), // Current timestamp
        isIntentSelection: true,
      };

      setMessages((prev) => [...prev, localMessage]);

      // Update the support case with selected intent
      await updateSupportCase(caseId, {
        intentId: intent.intentId || intent.intentid,
        pendingIntents: null, // Clear pending intents
      });

      // Send message to API in background
      const messageData = {
        senderId: "684d43c3234f6819aae4d80e",
        senderType: "customer",
        content: `Intent selected: ${intent.intent}`,
        messageType: "text",
        mediaUrls: [],
        isIntentSelection: true,
      };

      addSupportCaseMessage(caseId, messageData).catch((error) => {
        console.error("Error sending intent selection message:", error);
      });

      // Hide intent selection and reload case data
      setShowIntentSelection(false);
      setPendingIntents([]);
      await loadCaseData();
    } catch (error) {
      console.error("Error selecting intent:", error);
      setError("Failed to select intent. Please try again.");
    } finally {
      setIsSelectingIntent(false);
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
    if (inputValue.length > 500) return;

    try {
      setLoading(true);
      setUploadingFiles(selectedFiles.length > 0);

      let mediaUrls = [];

      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      const messageData = {
        senderId: "684d43c3234f6819aae4d80e",
        senderType: "customer",
        content: inputValue.trim() || "Shared media",
        messageType: mediaUrls.length > 0 ? "media" : "text",
        mediaUrls,
      };

      // Add message to local state immediately
      const localMessage = {
        messageId: Date.now().toString(), // Temporary ID
        senderId: "684d43c3234f6819aae4d80e",
        senderType: "customer",
        content: inputValue.trim() || "Shared media",
        messageType: mediaUrls.length > 0 ? "media" : "text",
        mediaUrls,
        createdAt: new Date().toISOString(), // Current timestamp
      };

      setMessages((prev) => [...prev, localMessage]);

      // Clear input immediately
      setInputValue("");
      setSelectedFiles([]);

      // Send to API in background (ignore response)
      addSupportCaseMessage(caseId, messageData).catch((error) => {
        console.error("Error sending message:", error);
        setError("Failed to send message. Please try again.");
      });

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
    // Only handle Enter key, allow all other keys (including Ctrl+V for paste)
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
            !showIntentSelection && (
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                iconName="refresh"
              >
                Refresh
              </Button>
            )
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

        {/* Intent Selection Section */}
        {showIntentSelection && (
          <Container>
            <SpaceBetween size="m">
              <Alert type="info" dismissible={false}>
                <SpaceBetween size="xs">
                  <div>
                    <strong>Please select a category for your issue</strong>
                  </div>
                  <div>
                    We found multiple categories that might match your problem.
                    Please select the one that best describes your issue to
                    continue.
                  </div>
                </SpaceBetween>
              </Alert>

              <Header variant="h3">
                Select the category that best matches your issue:
              </Header>

              <Cards
                cardDefinition={{
                  header: (item) => (
                    <SpaceBetween direction="horizontal" size="xs">
                      <Header variant="h4">{item.intent}</Header>
                      {item.confidenceScore && (
                        <Badge
                          color={item.confidenceScore > 80 ? "green" : "blue"}
                        >
                          {Math.round(item.confidenceScore)}% match
                        </Badge>
                      )}
                    </SpaceBetween>
                  ),
                  sections: [
                    {
                      content: (item) =>
                        item.description || "No description available",
                    },
                  ],
                }}
                items={pendingIntents}
                selectionType="single"
                onSelectionChange={({ detail }) => {
                  if (detail.selectedItems.length > 0) {
                    handleIntentSelect(detail.selectedItems[0]);
                  }
                }}
                loading={isSelectingIntent}
                loadingText="Selecting intent..."
              />
            </SpaceBetween>
          </Container>
        )}

        {/* Messages Area - Only show when not selecting intent */}
        {!showIntentSelection && (
          <>
            <div className="correspondence-container">
              {messages.length === 0 ? (
                <Box
                  textAlign="center"
                  color="text-status-inactive"
                  padding="l"
                >
                  No messages yet. Start the conversation below.
                </Box>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Section - Only show when not selecting intent */}
            <Container header={<Header variant="h3">Reply</Header>}>
              <SpaceBetween size="m">
                <FormField>
                  <Textarea
                    value={inputValue}
                    onChange={({ detail }) => {
                      // Allow pasting and truncate if necessary
                      const newValue =
                        detail.value.length > 500
                          ? detail.value.substring(0, 500)
                          : detail.value;
                      setInputValue(newValue);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    rows={8}
                    disabled={loading}
                    invalid={inputValue.length > 500}
                  />
                  <Box
                    fontSize="body-s"
                    color={
                      inputValue.length > 500
                        ? "text-status-error"
                        : "text-status-inactive"
                    }
                    textAlign="right"
                  >
                    {inputValue.length}/500 characters
                  </Box>
                </FormField>

                <FormField label="Attach images (optional)">
                  <SpaceBetween size="s">
                    <Button
                      variant="normal"
                      iconName="upload"
                      onClick={handleFileSelect}
                      disabled={loading}
                    >
                      Choose files
                    </Button>

                    {selectedFiles.length > 0 && (
                      <Box>
                        Selected files:{" "}
                        {selectedFiles.map((f) => f.name).join(", ")}
                      </Box>
                    )}
                  </SpaceBetween>
                </FormField>

                <Box textAlign="right">
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={
                      loading ||
                      (!inputValue.trim() && selectedFiles.length === 0) ||
                      inputValue.length > 500
                    }
                    loading={loading || uploadingFiles}
                  >
                    {uploadingFiles ? "Uploading..." : "Send Message"}
                  </Button>
                </Box>
              </SpaceBetween>
            </Container>
          </>
        )}
      </SpaceBetween>
    </Container>
  );
}
