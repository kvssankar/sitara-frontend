import React, { useState } from "react";
import {
  Button,
  FileUpload,
  ProgressBar,
  SpaceBetween,
  Header,
  Container,
  Box,
} from "@cloudscape-design/components";
import axios from "axios";
import { getPresignedUrl, processFile } from "../api/knowledge";

const KnowledgeFileUpload = ({ onUploadSuccess, setFlashMessages }) => {
  const [value, setValue] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.detail.value[0]);
    setUploadProgress(0);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Please select a file to upload.",
          id: "upload_error",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
      return;
    }

    setIsUploading(true);

    try {
      // Get presigned URL
      const { url } = await getPresignedUrl(
        selectedFile.name,
        selectedFile.type
      );

      if (!url) {
        throw new Error("Failed to get upload URL");
      }

      // Upload file to S3 using the pre-signed URL
      await axios.put(url, selectedFile, {
        headers: {
          "Content-Type": selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(percentage);
        },
      });

      // Process the file
      await processFile(selectedFile.name, selectedFile.type);

      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: "File uploaded and processed successfully!",
          id: "upload_success",
          onDismiss: () => setFlashMessages([]),
        },
      ]);

      // Reset form
      setSelectedFile(null);
      setValue([]);
      setUploadProgress(0);

      // Trigger refresh of file list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading file", error);
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Failed to upload file: " + error.message,
          id: "upload_error",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Upload documents to your knowledge base for AI-powered search and retrieval"
        >
          Upload Files
        </Header>
      }
    >
      <SpaceBetween size="l">
        <div>
          <FileUpload
            onChange={({ detail }) => {
              handleFileChange({ detail });
              setValue(detail.value);
            }}
            value={value}
            accept="application/pdf,.txt,.doc,.docx,.md"
            i18nStrings={{
              uploadButtonText: (e) => (e ? "Add files" : "Add file"),
              dropzoneText: (e) =>
                e ? "Drop files to upload" : "Drop file to upload",
              removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
              limitShowFewer: "Show fewer files",
              limitShowMore: "Show more files",
              errorIconAriaLabel: "Error",
              warningIconAriaLabel: "Warning",
            }}
            showFileLastModified
            showFileSize
            showFileThumbnail
            tokenLimit={1}
            constraintText="Supported formats: PDF, TXT, DOC, DOCX, MD (10MB max per file)"
          />
        </div>

        {isUploading && (
          <ProgressBar
            value={uploadProgress}
            description={`Uploading: ${uploadProgress}%`}
            variant={uploadProgress === 100 ? "success" : "info"}
          />
        )}

        <Box textAlign="left">
          <Button
            disabled={!selectedFile || isUploading}
            onClick={uploadFile}
            loading={isUploading}
            variant="primary"
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </Box>
      </SpaceBetween>
    </Container>
  );
};

export default KnowledgeFileUpload;
