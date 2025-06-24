import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Textarea,
  Multiselect,
} from "@cloudscape-design/components";
import { createIntent, updateIntent } from "../api/intents";
import { getTools } from "../api/tools";

const IntentFormModal = ({
  isEdit,
  intent,
  onFormSubmit,
  setFlashMessages,
}) => {
  console.log("IntentFormModal", intent);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    intent: "",
    description: "",
    steps: "",
    tools: [],
  });

  useEffect(() => {
    if (intent) {
      setFormData({
        intentid: intent.intentid,
        intent: intent.intent,
        description: intent.description || "",
        steps: intent.steps,
        tools: intent.tools || [],
      });
    }
  }, [intent]);
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    const newIntent = {
      intent: formData.intent,
      description: formData.description,
      steps: formData.steps,
      tools: formData.tools,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    try {
      if (!isEdit) {
        await createIntent(newIntent);
      } else {
        await updateIntent(formData);
      }
      onFormSubmit();

      setVisible(false);

      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: `Intent ${isEdit ? "updated" : "created"} successfully!`,
          id: "message_1",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
    } catch (e) {
      console.error(e);
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
      setVisible(false);
    }
  };

  const [tools, setTools] = useState([]);
  const fetchTools = async () => {
    const data = await getTools();
    console.log("Tools", data);
    //map tools.name and tools.description to options
    if (data) {
      const options = data?.map((tool) => ({
        label: tool.name,
        value: tool.name,
        description: tool.description,
      }));
      setTools(options);
    } else {
      setTools([]);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  return (
    <>
      <Button
        disabled={isEdit && !intent}
        variant="primary"
        onClick={() => setVisible(true)}
      >
        {isEdit ? "Edit Topic" : "Create New Topic"}
      </Button>
      <Modal
        onDismiss={() => setVisible(false)}
        visible={visible}
        closeAriaLabel="Close modal"
        header="Create New Intent"
      >
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setVisible(false)} variant="link">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                loading={submitting}
                disabled={submitting}
              >
                {isEdit ? "Save" : "Create"}
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="m">
            <FormField
              label="Topic Name"
              description="Enter the name of the intent."
              errorText={!formData.intent && "Topic Name is required."}
            >
              <Input
                value={formData.intent}
                onChange={({ detail }) =>
                  handleInputChange("intent", detail.value)
                }
                placeholder="Enter Topic Name"
              />
            </FormField>
            <FormField
              label="Description"
              description="Enter a description for the intent."
            >
              <Textarea
                value={formData.description}
                onChange={({ detail }) =>
                  handleInputChange("description", detail.value)
                }
                placeholder="Describe the intent purpose and functionality"
                rows={3}
              />
            </FormField>
            <FormField
              label="Steps"
              description="Enter the steps required for the intent."
            >
              <Textarea
                value={formData.steps}
                onChange={({ detail }) =>
                  handleInputChange("steps", detail.value)
                }
                placeholder="Describe the steps here"
              />
            </FormField>
            {/* <FormField
              label="Alternate Intent Utterances"
              description="Add alternate phrases for the intent."
            >
              <SpaceBetween direction="vertical" size="s">
                {formData.alternate_phrases.map((phrase, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <Input
                        value={phrase}
                        onChange={({ detail }) =>
                          handleAlternatePhraseChange(index, detail.value)
                        }
                        placeholder="Enter alternate phrase"
                      />
                    </div>

                    <Button
                      onClick={() => removeAlternatePhrase(index)}
                      variant="link"
                      iconName="close"
                      ariaLabel="Remove alternate phrase"
                    />
                  </div>
                ))}
                <Button onClick={addAlternatePhrase} variant="link">
                  Add Alternate Phrase
                </Button>
              </SpaceBetween>
            </FormField> */}
            <FormField
              label="Select tools"
              secondaryControl={
                <Button onClick={fetchTools} iconName="refresh" />
              }
            >
              <Multiselect
                selectedOptions={formData.tools}
                onChange={({ detail }) =>
                  handleInputChange("tools", detail.selectedOptions)
                }
                options={tools}
                placeholder="Choose options"
              />
            </FormField>
            {/* <Button onClick={handleGenerateUtterances} variant="primary">
              Generate Utterances
            </Button> */}
          </SpaceBetween>
        </Form>
      </Modal>
    </>
  );
};

export default IntentFormModal;
