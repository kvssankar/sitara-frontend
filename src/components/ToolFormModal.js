import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
  Select,
} from "@cloudscape-design/components";

import CodeEditor from "@cloudscape-design/components/code-editor";
import "ace-builds/css/ace.css";
import "ace-builds/css/theme/cloud_editor.css";
import "ace-builds/css/theme/cloud_editor_dark.css";
import { createTool, updateTool } from "../api/tools";

/**
 * Schema:
 * {
 *   name: string (required)
 *   description: string (required)
 *   params: [
 *     {
 *       name: string (required),
 *       description: string (required),
 *       type: string (string|number|boolean|enum),
 *       values?: string[]  // only if type === 'enum'
 *     }
 *   ],
 *   code: string (required)
 * }
 */
const i18nStrings = {
  loadingState: "Loading code editor",
  errorState: "There was an error loading the code editor.",
  errorStateRecovery: "Retry",

  editorGroupAriaLabel: "Code editor",
  statusBarGroupAriaLabel: "Status bar",

  cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
  errorsTab: "Errors",
  warningsTab: "Warnings",
  preferencesButtonAriaLabel: "Preferences",

  paneCloseButtonAriaLabel: "Close",

  preferencesModalHeader: "Preferences",
  preferencesModalCancel: "Cancel",
  preferencesModalConfirm: "Confirm",
  preferencesModalWrapLines: "Wrap lines",
  preferencesModalTheme: "Theme",
  preferencesModalLightThemes: "Light themes",
  preferencesModalDarkThemes: "Dark themes",
};

const defaultCode = `import json
import requests

#WRITE YOUR CODE IN THIS FUNCTION
def block_handler(params):
    print(params.get('age'))

    age = params.get('age', 0)
    if age < 18:
        return json.dumps({
            "message": "You are not allowed to drink alcohol",
        })
    else:
        return json.dumps({
            "message": "You are allowed to drink alcohol",
        })
`;

const nameRegex = /^[A-Za-z_]+$/; // Only letters (a-z, A-Z) and underscores

const CreateToolModal = ({ isEdit, tool, setFlashMessages, onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tool-level states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState(defaultCode);

  // Realtime validation states for tool fields
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // Param-level states
  const [params, setParams] = useState([]);
  // Realtime validation states for each param
  // We'll store an array of objects with shape: { nameError, descriptionError, valuesError }
  const [paramErrors, setParamErrors] = useState([]);

  // Code Editor states
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(undefined);
  const [ace, setAce] = useState();

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setDescription(tool.description);
      setCode(tool.code);
      setParams(tool.params);
    }
  }, [tool]);

  // Open & close
  const onDismiss = () => {
    setShowModal(false);

    // Reset states on close
    setCode(defaultCode);
    setDescription("");
    setName("");
    setParams([]);
    setNameError("");
    setDescriptionError("");
    setParamErrors([]);
  };

  // ----------------------
  // Validation utilities
  // ----------------------
  const validateToolName = (value) => {
    if (!value.trim()) {
      return "Name is required";
    } else if (!nameRegex.test(value)) {
      return "Name can only contain letters and underscores (no spaces or numbers)";
    }
    return "";
  };

  const validateToolDescription = (value) => {
    if (!value.trim()) {
      return "Description is required";
    }
    return "";
  };

  const validateParamName = (value) => {
    if (!value.trim()) {
      return "Parameter name is required";
    } else if (!nameRegex.test(value)) {
      return "Param name can only contain letters and underscores";
    }
    return "";
  };

  const validateParamDescription = (value) => {
    if (!value.trim()) {
      return "Param description is required";
    }
    return "";
  };

  const validateParamValues = (value, type) => {
    // If type is enum, values is required
    if (type === "enum") {
      if (!value || !value.trim()) {
        return "Enum values are required if type is 'enum'";
      }
    }
    return "";
  };

  // ----------------------
  // onChange handlers
  // ----------------------
  const handleNameChange = (value) => {
    setName(value);
    // Real-time validation for tool name
    setNameError(validateToolName(value));
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    // Real-time validation for tool description
    setDescriptionError(validateToolDescription(value));
  };

  // Adds a new param, along with default errors
  const handleAddParam = () => {
    setParams((prev) => [
      ...prev,
      { name: "", description: "", type: "string", values: "" },
    ]);
    setParamErrors((prev) => [
      ...prev,
      { nameError: "", descriptionError: "", valuesError: "" },
    ]);
  };

  // onChange for param fields
  const handleChangeParam = (index, key, value) => {
    // 1) Update the param's data
    setParams((prev) => {
      const newParams = [...prev];
      newParams[index] = { ...newParams[index], [key]: value };
      return newParams;
    });

    // 2) Real-time validation
    setParamErrors((prev) => {
      const newErrors = [...prev];
      const param = params[index] || {};
      const updatedType = key === "type" ? value : param.type;

      // Copy existing error object for that param
      const errorObj = { ...newErrors[index] };

      if (key === "name") {
        errorObj.nameError = validateParamName(value);
      }
      if (key === "description") {
        errorObj.descriptionError = validateParamDescription(value);
      }
      if (key === "type") {
        // If type changes to enum, check values
        errorObj.valuesError = validateParamValues(param.values, value);
      }
      if (key === "values") {
        errorObj.valuesError = validateParamValues(value, updatedType);
      }

      newErrors[index] = errorObj;
      return newErrors;
    });
  };

  const handleRemoveParam = (index) => {
    setParams((prev) => prev.filter((_, i) => i !== index));
    setParamErrors((prev) => prev.filter((_, i) => i !== index));
  };

  // Final form submission
  const handleSubmit = async () => {
    // Final check if there's any lingering validation error or required field missing
    // 1) Validate tool-level fields
    const finalNameError = validateToolName(name);
    const finalDescriptionError = validateToolDescription(description);

    // 2) Validate params
    const updatedParamErrors = params.map((param) => {
      return {
        nameError: validateParamName(param.name),
        descriptionError: validateParamDescription(param.description),
        valuesError: validateParamValues(param.values, param.type),
      };
    });

    setNameError(finalNameError);
    setDescriptionError(finalDescriptionError);
    setParamErrors(updatedParamErrors);

    // If any tool-level errors, do not proceed
    if (finalNameError || finalDescriptionError) {
      return;
    }

    // If any param errors, do not proceed
    const anyParamErrors = updatedParamErrors.some(
      (p) => p.nameError || p.descriptionError || p.valuesError
    );
    if (anyParamErrors) {
      return;
    } // If we get here, all validations have passed
    setSubmitting(true);
    try {
      if (!tool) {
        await createTool({
          name,
          description,
          params: params,
          code,
        });
      } else {
        await updateTool({
          name,
          description,
          params: params,
          code,
        });
      }
      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: `Tool ${isEdit ? "updated" : "created"} successfully!`,
          id: "message_1",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
      onDismiss();
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      const mssg =
        e.response?.data?.message || "An error occurred, please try again";
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: mssg,
          id: "message_2",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  // Load ACE
  useEffect(() => {
    async function loadAce() {
      const ace = await import("ace-builds");
      await import("ace-builds/webpack-resolver");
      ace.config.set("useStrictCSP", true);
      return ace;
    }

    loadAce()
      .then((ace) => setAce(ace))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Button
        disabled={isEdit && !tool}
        variant="primary"
        onClick={() => setShowModal(true)}
      >
        {isEdit ? "Edit Tool" : "Create Tool"}
      </Button>
      <Modal
        size="max"
        header="Create a Tool"
        visible={showModal}
        onDismiss={onDismiss}
        closeAriaLabel="Close modal"
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDismiss}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              {
                // If editing, show "Update" else "Create"
                isEdit ? "Update" : "Create"
              }
            </Button>
          </SpaceBetween>
        }
      >
        <Form>
          <FormField
            label="Name"
            description="Enter the tool name (letters/underscores only)"
            required
            errorText={nameError}
          >
            <Input
              disabled={isEdit}
              value={name}
              onChange={(event) => handleNameChange(event.detail.value)}
            />
          </FormField>

          <FormField
            label="Description"
            description="Enter the tool description"
            required
            errorText={descriptionError}
          >
            <Textarea
              value={description}
              onChange={(event) => handleDescriptionChange(event.detail.value)}
            />
          </FormField>

          <div
            style={{
              marginBottom: "1rem",
              marginTop: "1rem",
            }}
          >
            <Button onClick={handleAddParam}>Add Param</Button>
          </div>

          {params.map((param, index) => (
            <SpaceBetween key={index} direction="vertical" size="s">
              <FormField
                label={`Param #${index + 1} Name`}
                description="Enter parameter name (letters/underscores only)"
                required
                errorText={paramErrors[index]?.nameError}
              >
                <Input
                  value={param.name}
                  onChange={(e) =>
                    handleChangeParam(index, "name", e.detail.value)
                  }
                />
              </FormField>

              <FormField
                label="Param Description"
                description="Enter parameter description"
                required
                errorText={paramErrors[index]?.descriptionError}
              >
                <Textarea
                  value={param.description}
                  onChange={(e) =>
                    handleChangeParam(index, "description", e.detail.value)
                  }
                />
              </FormField>

              <FormField label="Param Type" required>
                <Select
                  selectedOption={{
                    label: param.type,
                    value: param.type,
                  }}
                  onChange={(e) =>
                    handleChangeParam(
                      index,
                      "type",
                      e.detail.selectedOption.value
                    )
                  }
                  options={[
                    { label: "string", value: "string" },
                    { label: "number", value: "number" },
                    { label: "boolean", value: "boolean" },
                    { label: "Values", value: "enum" },
                  ]}
                />
              </FormField>

              {param.type === "enum" && (
                <FormField
                  label="Enum values"
                  description="Enter comma-separated values for the enum ex: white,light black,red"
                  required
                  errorText={paramErrors[index]?.valuesError}
                >
                  <Input
                    value={param.values}
                    onChange={(e) =>
                      handleChangeParam(index, "values", e.detail.value)
                    }
                  />
                </FormField>
              )}

              <Button onClick={() => handleRemoveParam(index)}>Remove</Button>
              <hr />
            </SpaceBetween>
          ))}

          <FormField
            stretch
            label="Code"
            description="Write or paste tool code here"
            required
          >
            <CodeEditor
              ace={ace}
              value={code}
              language="python"
              onChange={({ detail }) => setCode(detail.value)}
              preferences={preferences}
              onPreferencesChange={(e) => setPreferences(e.detail)}
              loading={loading}
              i18nStrings={i18nStrings}
              themes={{ light: ["cloud_editor"], dark: ["cloud_editor_dark"] }}
            />
          </FormField>
        </Form>
      </Modal>
    </>
  );
};

export default CreateToolModal;
