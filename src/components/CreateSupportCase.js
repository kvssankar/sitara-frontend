import React, { useState } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Textarea,
  Alert,
  Cards,
  Badge,
  Box,
  FormField,
  ContentLayout,
} from "@cloudscape-design/components";
import {
  searchIntents,
  createSupportCase,
  addSupportCaseMessage,
  processNewCase,
} from "../api/support";

export default function CreateSupportCase() {
  const [issueText, setIssueText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matchingIntents, setMatchingIntents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [hasMinimumWords, setHasMinimumWords] = useState(false);

  const customerId = localStorage.getItem("userId") || "";

  // Helper function to count words
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };
  // Handle text change with word validation
  const handleTextChange = (value) => {
    setIssueText(value);
    const words = countWords(value);
    setWordCount(words);
    setHasMinimumWords(words >= 10);
  };
  const handleSearch = async () => {
    if (!issueText.trim()) {
      setFlashMessage({
        type: "warning",
        content: "Please describe your issue to continue",
        dismissible: true,
      });
      return;
    }
    if (!hasMinimumWords) {
      setFlashMessage({
        type: "warning",
        content:
          "Please provide at least 10 words in your description to search for matching categories",
        dismissible: true,
      });
      return;
    }

    setIsSearching(true);
    setFlashMessage(null);

    try {
      const result = await searchIntents(issueText.trim());
      if (result.success && result.intents.length > 0) {
        setMatchingIntents(result.intents);
      } else {
        setMatchingIntents([]);
        setFlashMessage({
          type: "info",
          content:
            "No matching categories found. You can create a general support case.",
          dismissible: true,
        });
      }
    } catch (error) {
      console.error("Error searching intents:", error);
      setFlashMessage({
        type: "error",
        content: "Failed to process your request. Please try again.",
        dismissible: true,
      });
      setMatchingIntents([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIntentSelect = async (intent) => {
    setIsCreating(true);
    setFlashMessage(null);

    try {
      // Create the support case with intent as title
      const supportCase = await createSupportCase({
        customerId,
        title: intent.intent,
        description: issueText,
        priority: "medium",
        intentId: intent.intentId || intent.intentid,
      });

      const caseId = supportCase.caseId;

      // Add initial message with user's description
      await addSupportCaseMessage(caseId, {
        senderId: customerId,
        senderType: "customer",
        content: issueText,
        messageType: "text",
        mediaUrls: [],
        isNewTicket: true,
      });

      // Process the new case
      processNewCase(caseId);

      // Success! Reset form
      setIssueText("");
      setMatchingIntents([]);

      setFlashMessage({
        type: "success",
        content: `Support case created successfully! Case ID: ${caseId}`,
        dismissible: true,
      });
    } catch (error) {
      console.error("Error creating support case:", error);
      setFlashMessage({
        type: "error",
        content: "Failed to create support case. Please try again.",
        dismissible: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateWithoutIntent = async () => {
    setIsCreating(true);
    setFlashMessage(null);

    try {
      // Create general support case with user's text as title (truncated)
      const title =
        issueText.length > 100
          ? issueText.substring(0, 100) + "..."
          : issueText;

      const supportCase = await createSupportCase({
        customerId,
        title,
        description: issueText,
        priority: "medium",
      });

      const caseId = supportCase.caseId;

      // Add initial message
      await addSupportCaseMessage(caseId, {
        senderId: customerId,
        senderType: "customer",
        content: issueText,
        messageType: "text",
        mediaUrls: [],
        isNewTicket: true,
      });

      processNewCase(caseId);

      // Success! Reset form
      setIssueText("");
      setMatchingIntents([]);

      setFlashMessage({
        type: "success",
        content: `Support case created successfully! Case ID: ${caseId}`,
        dismissible: true,
      });
    } catch (error) {
      console.error("Error creating support case:", error);
      setFlashMessage({
        type: "error",
        content: "Failed to create support case. Please try again.",
        dismissible: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ContentLayout>
      <Container>
        <SpaceBetween size="l">
          <Header variant="h1">Create Support Case</Header>
          {flashMessage && (
            <Alert
              type={flashMessage.type}
              dismissible={flashMessage.dismissible}
              onDismiss={() => setFlashMessage(null)}
            >
              {flashMessage.content}
            </Alert>
          )}{" "}
          <FormField
            label="Describe your issue"
            description={`Please provide details about the problem you're experiencing (${wordCount}/10 words minimum)`}
            errorText={
              wordCount > 0 && !hasMinimumWords
                ? `Please add ${10 - wordCount} more words to enable search`
                : undefined
            }
          >
            <Textarea
              value={issueText}
              onChange={(e) => handleTextChange(e.detail.value)}
              placeholder="Enter your issue description here..."
              rows={6}
            />
          </FormField>{" "}
          <Box textAlign="left">
            <Button
              variant="primary"
              onClick={handleSearch}
              loading={isSearching}
              disabled={!issueText.trim() || !hasMinimumWords || isCreating}
            >
              {isSearching ? "Processing..." : "Create"}
            </Button>
          </Box>
          {matchingIntents.length > 0 && (
            <SpaceBetween size="m">
              <Header variant="h2">
                Select the category that best matches your issue:
              </Header>
              <Cards
                cardDefinition={{
                  header: (item) => (
                    <SpaceBetween direction="horizontal" size="xs">
                      <Header variant="h3">{item.intent}</Header>
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
                      id: "description",
                      content: (item) =>
                        item.description || "Category for similar issues",
                    },
                    {
                      id: "actions",
                      content: (item) => (
                        <Button
                          variant="primary"
                          onClick={() => handleIntentSelect(item)}
                          loading={isCreating}
                          disabled={isCreating}
                        >
                          Select This Category
                        </Button>
                      ),
                    },
                  ],
                }}
                items={matchingIntents}
              />
            </SpaceBetween>
          )}
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
