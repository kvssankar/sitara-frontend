// src/components/CreateSupportCase.js

import React, { useState } from "react";
import {
  Form,
  SpaceBetween,
  Button,
  Container,
  Header,
  FormField,
  Input,
  Textarea,
  Select,
  FileUpload,
  Alert,
  ProgressBar,
  Box,
  ContentLayout,
} from "@cloudscape-design/components";
import {
  createSupportCase,
  getSupportCaseUploadUrl,
  addSupportCaseMessage,
  processNewCase,
} from "../api/support";
import axios from "axios";

export default function CreateSupportCase() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: { label: "Medium", value: "medium" },
    customerId: "customer123", // You can get this from auth context
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [flashMessage, setFlashMessage] = useState(null);

  const priorityOptions = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const uploadFile = async (file, caseId) => {
    try {
      // Get presigned URL
      const { uploadUrl, publicUrl } = await getSupportCaseUploadUrl(
        caseId,
        file.name,
        file.type
      );

      // Upload file to S3
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setFlashMessage({
        type: "error",
        content: "Please fill in both title and description",
        dismissible: true,
      });
      return;
    }

    setIsSubmitting(true);
    setFlashMessage(null);
    try {
      // Step 1: Create the support case
      const supportCase = await createSupportCase({
        customerId: formData.customerId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority.value,
      });

      const caseId = supportCase.caseId;

      // Step 2: Upload files if any
      let mediaUrls = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          try {
            const fileUrl = await uploadFile(file, caseId);
            mediaUrls.push(fileUrl);
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
          }
        }
      }

      // Step 3: Add initial message with description and files
      await addSupportCaseMessage(caseId, {
        senderId: formData.customerId,
        senderType: "customer",
        content: formData.description,
        messageType: mediaUrls.length > 0 ? "mixed" : "text",
        mediaUrls,
        isNewTicket: true,
      });

      processNewCase(caseId);

      // Success! Reset form
      setFormData({
        title: "",
        description: "",
        priority: { label: "Medium", value: "medium" },
        customerId: formData.customerId,
      });
      setFiles([]);
      setUploadProgress({});

      setFlashMessage({
        type: "success",
        content: `Support case created successfully! Case ID: ${caseId}`,
        dismissible: true,
      });

      // You can redirect to the case detail page here
      // window.location.href = `/support/cases/${caseId}`;
    } catch (error) {
      console.error("Error creating support case:", error);
      setFlashMessage({
        type: "error",
        content: "Failed to create support case. Please try again.",
        dismissible: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = ({ detail }) => {
    const selectedFiles = Array.from(detail.value);

    // Filter for allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
    ];
    const validFiles = selectedFiles.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        setFlashMessage({
          type: "warning",
          content: `File type ${file.type} is not supported. Please upload images, PDFs, or text files.`,
          dismissible: true,
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setFlashMessage({
          type: "warning",
          content: `File ${file.name} is too large. Maximum size is 10MB.`,
          dismissible: true,
        });
        return false;
      }
      return true;
    });

    setFiles(validFiles);
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Submit a support request and our team will assist you"
        >
          Create Support Ticket
        </Header>
      }
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

        <Container>
          <form onSubmit={handleSubmit}>
            <Form
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    formAction="none"
                    variant="link"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    loading={isSubmitting}
                    disabled={
                      !formData.title.trim() || !formData.description.trim()
                    }
                  >
                    {isSubmitting
                      ? "Creating Ticket..."
                      : "Create Support Ticket"}
                  </Button>
                </SpaceBetween>
              }
            >
              <SpaceBetween direction="vertical" size="l">
                <FormField
                  label="Issue Title"
                  description="Provide a brief, clear title for your issue"
                  constraintText="Required"
                >
                  <Input
                    value={formData.title}
                    onChange={({ detail }) =>
                      handleInputChange("title", detail.value)
                    }
                    placeholder="Brief description of your issue..."
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Priority"
                  description="Select the urgency level of your issue"
                >
                  <Select
                    selectedOption={formData.priority}
                    onChange={({ detail }) =>
                      handleInputChange("priority", detail.selectedOption)
                    }
                    options={priorityOptions}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Description"
                  description="Provide detailed information about your issue"
                  constraintText="Required"
                >
                  <Textarea
                    value={formData.description}
                    onChange={({ detail }) =>
                      handleInputChange("description", detail.value)
                    }
                    placeholder="Please provide a detailed description of your issue. Include any error messages, steps to reproduce, or relevant information that might help us assist you better..."
                    rows={8}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Attachments"
                  description="Upload relevant files (images, PDFs, text files)"
                  constraintText="PNG, JPG, PDF up to 10MB each"
                >
                  <FileUpload
                    onChange={handleFileChange}
                    value={files}
                    multiple={true}
                    accept="image/*,.pdf,.txt"
                    showFileLastModified={true}
                    showFileSize={true}
                    showFileThumbnail={true}
                    tokenLimit={5}
                    i18nStrings={{
                      uploadButtonText: (e) =>
                        e ? "Choose files" : "Choose file",
                      dropzoneText: (e) =>
                        e ? "Drop files to upload" : "Drop file to upload",
                      removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
                      limitShowFewer: "Show fewer files",
                      limitShowMore: "Show more files",
                      errorIconAriaLabel: "Error",
                    }}
                    disabled={isSubmitting}
                  />
                </FormField>

                {/* Show upload progress for files */}
                {Object.keys(uploadProgress).length > 0 && (
                  <FormField label="Upload Progress">
                    <SpaceBetween direction="vertical" size="s">
                      {Object.entries(uploadProgress).map(
                        ([fileName, progress]) => (
                          <Box key={fileName}>
                            <SpaceBetween
                              direction="horizontal"
                              size="s"
                              alignItems="center"
                            >
                              <Box variant="small">{fileName}</Box>
                              {progress === 100 ? (
                                <Box
                                  variant="small"
                                  color="text-status-success"
                                >
                                  ✓ Uploaded
                                </Box>
                              ) : progress === -1 ? (
                                <Box variant="small" color="text-status-error">
                                  ✗ Failed
                                </Box>
                              ) : (
                                <ProgressBar
                                  value={progress}
                                  description={`${progress}%`}
                                  size="small"
                                />
                              )}
                            </SpaceBetween>
                          </Box>
                        )
                      )}
                    </SpaceBetween>
                  </FormField>
                )}
              </SpaceBetween>
            </Form>
          </form>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
