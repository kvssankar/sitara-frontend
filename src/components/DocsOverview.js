import React from "react";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import {
  CopyToClipboard,
  Link,
  ProgressBar,
  StatusIndicator,
} from "@cloudscape-design/components";

export default function DocsOverview() {
  return (
    <KeyValuePairs
      columns={3}
      items={[
        {
          label: "Knowledge Base ID",
          value: "E1WG1ZNPRXT0D4",
          info: (
            <Link variant="info" href="#">
              Info
            </Link>
          ),
        },
        {
          label: "Status",
          value: <StatusIndicator>Available</StatusIndicator>,
        },
        {
          label: "Docs Quota",
          id: "docs-quota-id",
          value: (
            <ProgressBar
              value={30}
              //   additionalInfo="Additional information"
              description="Doc space used"
              ariaLabelledby="docs-quota-id"
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
