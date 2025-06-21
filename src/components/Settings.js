import * as React from "react";
import Form from "@cloudscape-design/components/form";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import { Select } from "@cloudscape-design/components";

export default function Settings() {
  const [selectedOption, setSelectedOption] = React.useState({
    label: "Option 1",
    value: "1",
  });
  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: "20px" }}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link">
              Cancel
            </Button>
            <Button variant="primary">Submit</Button>
          </SpaceBetween>
        }
        // header={<Header variant="h1">Form header</Header>}
      >
        <Container header={<Header variant="h2">Chatbot Settings</Header>}>
          <SpaceBetween direction="vertical" size="l">
            <FormField label="Name">
              <Input />
            </FormField>
            <FormField label="Theme">
              <Select
                selectedOption={selectedOption}
                onChange={({ detail }) =>
                  setSelectedOption(detail.selectedOption)
                }
                options={[
                  { label: "Option 1", value: "1" },
                  { label: "Option 2", value: "2" },
                  { label: "Option 3", value: "3" },
                  { label: "Option 4", value: "4" },
                  { label: "Option 5", value: "5" },
                ]}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
}
