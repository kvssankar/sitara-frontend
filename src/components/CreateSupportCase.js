// src/components/CreateSupportCase.js
import React, { useState } from "react";
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Input,
  Textarea,
  Alert,
  FormField,
  ContentLayout,
} from "@cloudscape-design/components";
import { createSupportCase, addSupportCaseMessage } from "../api/support";

export default function CreateSupportCase() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);

  const customerId = localStorage.getItem("userId") || "";

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setFlashMessage({
        type: "warning",
        content: "Please enter a title for your support ticket",
        dismissible: true,
      });
      return;
    }

    if (!description.trim()) {
      setFlashMessage({
        type: "warning",
        content: "Please enter a description for your support ticket",
        dismissible: true,
      });
      return;
    }

    setIsCreating(true);
    setFlashMessage(null);

    try {
      // Step 1: Create support case
      const supportCase = await createSupportCase({
        customerId,
        title: title.trim(),
        description: description.trim(),
        priority: "medium",
      });

      const caseId = supportCase.caseId;

      // Step 2: Add initial message
      await addSupportCaseMessage(caseId, {
        senderId: customerId,
        content: description.trim(),
      });

      // Success! Reset form
      setTitle("");
      setDescription("");
      setFlashMessage({
        type: "success",
        content: `Support ticket created successfully! Case ID: ${caseId}`,
        dismissible: true,
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      setFlashMessage({
        type: "error",
        content: "Failed to create support ticket. Please try again.",
        dismissible: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Create a new support ticket to get help from our team"
        >
          Create Support Ticket
        </Header>
      }
    >
      <Container>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <SpaceBetween direction="vertical" size="l">
            {flashMessage && (
              <Alert
                type={flashMessage.type}
                dismissible={flashMessage.dismissible}
                onDismiss={() => setFlashMessage(null)}
              >
                {flashMessage.content}
              </Alert>
            )}

            <FormField label="Title" description="Brief summary of your issue">
              <Input
                value={title}
                onChange={({ detail }) => setTitle(detail.value)}
                placeholder="e.g., Unable to access my account"
                disabled={isCreating}
              />
            </FormField>

            <FormField
              label="Description"
              description="Detailed description of your issue"
            >
              <Textarea
                value={description}
                onChange={({ detail }) => setDescription(detail.value)}
                placeholder="Please provide as much detail as possible about your issue..."
                rows={6}
                disabled={isCreating}
              />
            </FormField>

            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isCreating}
              disabled={isCreating}
            >
              Create Support Ticket
            </Button>
          </SpaceBetween>
        </form>
      </Container>
    </ContentLayout>
  );
}
