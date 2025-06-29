// src/components/SupportCaseOverview.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Header,
  ColumnLayout,
  Box,
  Badge,
  Link,
  Button,
  SpaceBetween,
  StatusIndicator,
  KeyValuePairs,
  Modal,
  Alert,
  Cards,
  ProgressBar,
} from "@cloudscape-design/components";
import { getSupportCase, updateSupportCase } from "../api/support";

const PRIORITY_COLORS = {
  low: "green",
  medium: "blue",
  high: "red",
  urgent: "red",
};

const STATUS_COLORS = {
  open: "blue",
  "in-progress": "grey",
  resolved: "green",
  closed: "grey",
};

const EFFECTIVENESS_COLORS = {
  high: "green",
  medium: "blue",
  low: "red",
};

const SATISFACTION_COLORS = {
  high: "green",
  medium: "blue",
  low: "red",
};

export default function SupportCaseOverview({ caseId }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      const caseResponse = await getSupportCase(caseId);
      setCaseData(caseResponse);

      // Parse summary if it exists and is a string
      if (caseResponse.summary && typeof caseResponse.summary === "string") {
        try {
          setSummaryData(JSON.parse(caseResponse.summary));
        } catch (e) {
          console.warn("Could not parse summary JSON:", e);
        }
      } else if (
        caseResponse.summary &&
        typeof caseResponse.summary === "object"
      ) {
        setSummaryData(caseResponse.summary);
      }
    } catch (error) {
      console.error("Error loading case data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      setResolutionLoading(true);
      setUpdateError(null);

      await updateSupportCase(caseId, {
        resolved: true,
        status: "resolved",
      });

      // Reload case data to reflect changes
      await loadCaseData();
    } catch (error) {
      console.error("Error marking case as resolved:", error);
      setUpdateError("Failed to mark case as resolved. Please try again.");
    } finally {
      setResolutionLoading(false);
    }
  };

  const handleMarkUnresolved = async () => {
    try {
      setResolutionLoading(true);
      setUpdateError(null);

      await updateSupportCase(caseId, {
        resolved: false,
        status: "open",
      });

      // Reload case data to reflect changes
      await loadCaseData();
    } catch (error) {
      console.error("Error marking case as unresolved:", error);
      setUpdateError("Failed to mark case as unresolved. Please try again.");
    } finally {
      setResolutionLoading(false);
    }
  };

  const handleViewSummary = () => {
    setSummaryModalVisible(true);
  };

  const renderSummaryModal = () => {
    if (!summaryData) return null;

    const aiPerformance = summaryData.aiAgentPerformance || {};
    const humanInvolvement = summaryData.humanAgentInvolvement || {};
    const resolutionStatus = summaryData.resolutionStatus || {};
    const insights = summaryData.insights || {};

    return (
      <Modal
        onDismiss={() => setSummaryModalVisible(false)}
        visible={summaryModalVisible}
        size="large"
        header="AI-Generated Case Summary"
      >
        <SpaceBetween size="l">
          {/* Case Summary */}
          <Container header={<Header variant="h3">Case Summary</Header>}>
            <Box>{summaryData.caseSummary}</Box>
          </Container>

          {/* Customer Issue */}
          <Container header={<Header variant="h3">Customer Issue</Header>}>
            <Box>{summaryData.customerIssue}</Box>
          </Container>

          {/* Key Interactions */}
          {summaryData.keyInteractions &&
            summaryData.keyInteractions.length > 0 && (
              <Container
                header={<Header variant="h3">Key Interactions</Header>}
              >
                <SpaceBetween size="xs">
                  {summaryData.keyInteractions.map((interaction, index) => (
                    <Box key={index} variant="p">
                      • {interaction}
                    </Box>
                  ))}
                </SpaceBetween>
              </Container>
            )}

          {/* AI Agent Performance */}
          <Container
            header={<Header variant="h3">AI Agent Performance</Header>}
          >
            <SpaceBetween size="m">
              <ColumnLayout columns={3}>
                <div>
                  <Box variant="awsui-key-label">Effectiveness</Box>
                  <Badge
                    color={
                      EFFECTIVENESS_COLORS[aiPerformance.effectiveness] ||
                      "grey"
                    }
                  >
                    {aiPerformance.effectiveness || "N/A"}
                  </Badge>
                </div>
                <div>
                  <Box variant="awsui-key-label">Helpful Responses</Box>
                  <Box>{aiPerformance.helpfulResponses || 0}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">Issues Resolved</Box>
                  <Box>{aiPerformance.issuesResolved?.length || 0}</Box>
                </div>
              </ColumnLayout>

              {aiPerformance.issuesResolved &&
                aiPerformance.issuesResolved.length > 0 && (
                  <div>
                    <Box variant="awsui-key-label">Resolved Issues</Box>
                    <SpaceBetween size="xs">
                      {aiPerformance.issuesResolved.map((issue, index) => (
                        <Box key={index} variant="p">
                          • {issue}
                        </Box>
                      ))}
                    </SpaceBetween>
                  </div>
                )}

              {aiPerformance.limitations &&
                aiPerformance.limitations.length > 0 && (
                  <div>
                    <Box variant="awsui-key-label">AI Limitations</Box>
                    <SpaceBetween size="xs">
                      {aiPerformance.limitations.map((limitation, index) => (
                        <Box key={index} variant="p">
                          • {limitation}
                        </Box>
                      ))}
                    </SpaceBetween>
                  </div>
                )}
            </SpaceBetween>
          </Container>

          {/* Human Agent Involvement */}
          <Container
            header={<Header variant="h3">Human Agent Involvement</Header>}
          >
            <ColumnLayout columns={2}>
              <div>
                <Box variant="awsui-key-label">Required</Box>
                <Badge color={humanInvolvement.required ? "red" : "green"}>
                  {humanInvolvement.required ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <Box variant="awsui-key-label">Effectiveness</Box>
                <Box>
                  {humanInvolvement.effectivenessOfIntervention || "N/A"}
                </Box>
              </div>
            </ColumnLayout>

            {humanInvolvement.reasonForEscalation && (
              <div>
                <Box variant="awsui-key-label">Escalation Reason</Box>
                <Box>{humanInvolvement.reasonForEscalation}</Box>
              </div>
            )}
          </Container>

          {/* Resolution Status */}
          <Container header={<Header variant="h3">Resolution Status</Header>}>
            <SpaceBetween size="m">
              <ColumnLayout columns={3}>
                <div>
                  <Box variant="awsui-key-label">Resolved</Box>
                  <Badge color={resolutionStatus.isResolved ? "green" : "red"}>
                    {resolutionStatus.isResolved ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Box variant="awsui-key-label">Resolution Method</Box>
                  <Box>{resolutionStatus.resolutionMethod || "N/A"}</Box>
                </div>
                <div>
                  <Box variant="awsui-key-label">Customer Satisfaction</Box>
                  <Badge
                    color={
                      SATISFACTION_COLORS[
                        resolutionStatus.customerSatisfactionLevel
                      ] || "grey"
                    }
                  >
                    {resolutionStatus.customerSatisfactionLevel || "N/A"}
                  </Badge>
                </div>
              </ColumnLayout>

              {resolutionStatus.pendingActions &&
                resolutionStatus.pendingActions.length > 0 && (
                  <div>
                    <Box variant="awsui-key-label">Pending Actions</Box>
                    <SpaceBetween size="xs">
                      {resolutionStatus.pendingActions.map((action, index) => (
                        <Box key={index} variant="p">
                          • {action}
                        </Box>
                      ))}
                    </SpaceBetween>
                  </div>
                )}
            </SpaceBetween>
          </Container>

          {/* Insights */}
          <Container header={<Header variant="h3">Insights</Header>}>
            <SpaceBetween size="s">
              {insights.customerBehavior && (
                <div>
                  <Box variant="awsui-key-label">Customer Behavior</Box>
                  <Box>{insights.customerBehavior}</Box>
                </div>
              )}

              {insights.commonIssueType && (
                <div>
                  <Box variant="awsui-key-label">Issue Type</Box>
                  <Badge>{insights.commonIssueType}</Badge>
                </div>
              )}

              {insights.improvementSuggestions &&
                insights.improvementSuggestions.length > 0 && (
                  <div>
                    <Box variant="awsui-key-label">Improvement Suggestions</Box>
                    <SpaceBetween size="xs">
                      {insights.improvementSuggestions.map(
                        (suggestion, index) => (
                          <Box key={index} variant="p">
                            • {suggestion}
                          </Box>
                        )
                      )}
                    </SpaceBetween>
                  </div>
                )}
            </SpaceBetween>
          </Container>

          {/* Next Steps & Tags */}
          <ColumnLayout columns={2}>
            {summaryData.nextSteps && summaryData.nextSteps.length > 0 && (
              <Container header={<Header variant="h3">Next Steps</Header>}>
                <SpaceBetween size="xs">
                  {summaryData.nextSteps.map((step, index) => (
                    <Box key={index} variant="p">
                      • {step}
                    </Box>
                  ))}
                </SpaceBetween>
              </Container>
            )}

            <Container header={<Header variant="h3">Metadata</Header>}>
              <SpaceBetween size="s">
                {summaryData.tags && summaryData.tags.length > 0 && (
                  <div>
                    <Box variant="awsui-key-label">Tags</Box>
                    <SpaceBetween direction="horizontal" size="xs">
                      {summaryData.tags.map((tag, index) => (
                        <Badge key={index}>{tag}</Badge>
                      ))}
                    </SpaceBetween>
                  </div>
                )}

                {summaryData.timeToResolution && (
                  <div>
                    <Box variant="awsui-key-label">Time to Resolution</Box>
                    <Box>{summaryData.timeToResolution}</Box>
                  </div>
                )}
              </SpaceBetween>
            </Container>
          </ColumnLayout>
        </SpaceBetween>
      </Modal>
    );
  };

  if (loading) {
    return (
      <StatusIndicator type="loading">Loading case details...</StatusIndicator>
    );
  }

  if (!caseData) {
    return <Box>Case not found</Box>;
  }

  // Check if case has been resolved/unresolved already
  const hasResolutionStatus =
    caseData.resolved !== undefined && caseData.resolved !== null;
  const isResolved = caseData.resolved === true;
  const hasSummary =
    caseData.summary &&
    (typeof caseData.summary === "string" ||
      typeof caseData.summary === "object");

  const keyValueItems = [
    {
      label: "Case ID",
      value: caseData.caseId,
    },
    {
      label: "Status",
      value: (
        <Badge color={STATUS_COLORS[caseData.status] || "grey"}>
          {caseData.status}
        </Badge>
      ),
    },
    {
      label: "Priority",
      value: (
        <Badge color={PRIORITY_COLORS[caseData.priority] || "grey"}>
          {caseData.priority}
        </Badge>
      ),
    },
    {
      label: "Resolved",
      value: hasResolutionStatus ? (
        <Badge color={isResolved ? "green" : "red"}>
          {isResolved ? "Yes" : "No"}
        </Badge>
      ) : (
        <Badge color="grey">In Progress</Badge>
      ),
    },
    {
      label: "Created",
      value: new Date(caseData.createdAt).toLocaleString(),
    },
    {
      label: "Last Updated",
      value: new Date(caseData.updatedAt).toLocaleString(),
    },
    {
      label: "Assigned Agent",
      value: caseData.assignedAgent || "Not assigned",
    },
  ];

  return (
    <>
      <Container
        header={
          <Header
            variant="h2"
            description={caseData.description}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                {/* Mark as Resolved/Unresolved buttons - disabled if already has resolution status */}
                <Button
                  onClick={handleMarkResolved}
                  loading={resolutionLoading}
                  disabled={hasResolutionStatus}
                  variant={isResolved ? "primary" : "normal"}
                  iconName={
                    isResolved ? "status-positive" : "status-in-progress"
                  }
                >
                  Mark as Resolved
                </Button>

                <Button
                  onClick={handleMarkUnresolved}
                  loading={resolutionLoading}
                  disabled={hasResolutionStatus}
                  variant={
                    hasResolutionStatus && !isResolved ? "primary" : "normal"
                  }
                  iconName="status-negative"
                >
                  Mark as Unresolved
                </Button>

                {/* View Summary button - disabled if no summary */}
                <Button
                  onClick={handleViewSummary}
                  disabled={!hasSummary}
                  iconName="gen-ai"
                >
                  View Summary
                </Button>

                <Button onClick={loadCaseData} iconName="refresh">
                  Refresh
                </Button>
              </SpaceBetween>
            }
          >
            {caseData.title}
          </Header>
        }
      >
        <SpaceBetween size="l">
          <KeyValuePairs columns={3} items={keyValueItems} />

          {updateError && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setUpdateError(null)}
            >
              {updateError}
            </Alert>
          )}

          {summaryError && (
            <Alert
              type="error"
              dismissible
              onDismiss={() => setSummaryError(null)}
            >
              {summaryError}
            </Alert>
          )}

          {caseData.mediaUrls && caseData.mediaUrls.length > 0 && (
            <Container header={<Header variant="h3">Attachments</Header>}>
              <SpaceBetween size="xs">
                {caseData.mediaUrls.map((url, index) => (
                  <Link key={index} external href={url}>
                    Attachment {index + 1}
                  </Link>
                ))}
              </SpaceBetween>
            </Container>
          )}
        </SpaceBetween>
      </Container>

      {renderSummaryModal()}
    </>
  );
}
