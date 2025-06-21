import React from "react";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import {
  CopyToClipboard,
  Link,
  ProgressBar,
  StatusIndicator,
} from "@cloudscape-design/components";

export default function Overview() {
  return (
    <KeyValuePairs
      columns={3}
      items={[
        {
          label: "Chatbot ID",
          value: "E1WG1ZNPRXT0D4",
          info: (
            <Link variant="info" href="#">
              Info
            </Link>
          ),
        },
        {
          label: "API URL",
          value: (
            <CopyToClipboard
              copyButtonAriaLabel="Copy API Url"
              copyErrorText="failed to copy"
              copySuccessText="copied"
              textToCopy="https://api.example.com"
              variant="inline"
            />
          ),
        },
        {
          label: "Status",
          value: <StatusIndicator>Available</StatusIndicator>,
        },
        {
          label: "Message Quota",
          id: "message-quota-id",
          value: (
            <ProgressBar
              value={30}
              //   additionalInfo="Additional information"
              description="Messages used"
              ariaLabelledby="message-quota-id"
            />
          ),
        },
        // {
        //   label: "Price class",
        //   value: "Use only US, Canada, Europe",
        // },
        // {
        //   label: "CNAMEs",
        //   value: (
        //     <Link external={true} href="#">
        //       abc.service23G24.xyz
        //     </Link>
        //   ),
        // },
      ]}
    />
  );
}
