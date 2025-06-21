import React, { useState } from "react";
import {
  Button,
  FileUpload,
  ProgressBar,
  SpaceBetween,
  Alert,
  Header,
} from "@cloudscape-design/components";
import axios from "axios";
import { getPresignedUrl, processFile } from "../api/s3";

const UploadToS3 = ({ setFlashMessages }) => {
  const [value, setValue] = React.useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.detail.value[0]);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  console.log(selectedFile, isUploading);

  const uploadFile = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const { url } = await getPresignedUrl(
        selectedFile.name,
        selectedFile.type
      );

      // Upload file to S3 using the pre-signed URL
      await axios
        .put(url, selectedFile, {
          headers: {
            "Content-Type": selectedFile.type,
          },
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(percentage);
          },
        })
        .then(() => {
          processFile(selectedFile.name, selectedFile.type);
        });

      //   setSuccessMessage("File uploaded successfully!");
      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: "File uploaded successfully, refresh the page to see it.",
          id: "message_1",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
      setSelectedFile(null);
      setValue([]);
    } catch (error) {
      console.error("Error uploading file", error);
      //   setErrorMessage("Failed to upload file: " + error.message);
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Failed to upload file: " + error.message,
          id: "message_2",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SpaceBetween size="l">
      {/* <Header variant="h1">Add new file to knowledge base</Header> */}

      {errorMessage && <Alert type="error">{errorMessage}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <div style={{ marginTop: "1rem" }}>
        <FileUpload
          onChange={({ detail }) => {
            handleFileChange({ detail });
            setValue(detail.value);
            console.log("FileUpload: ", detail);
          }}
          value={value}
          accept="application/pdf"
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
          tokenLimit={3}
          constraintText="*pdf files only (5mb max)"
        />
      </div>

      {isUploading && (
        <ProgressBar
          value={uploadProgress}
          description={`Uploading: ${uploadProgress}%`}
          variant={uploadProgress === 100 ? "success" : "info"}
        />
      )}

      <div
        style={{
          marginBottom: "1rem",
        }}
      >
        <Button
          disabled={!selectedFile || isUploading}
          onClick={uploadFile}
          loading={isUploading}
        >
          Upload
        </Button>
      </div>
    </SpaceBetween>
  );
};

export default UploadToS3;
