import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Container,
  Header,
  ColumnLayout,
  Box,
} from "@cloudscape-design/components";
import { getFiles } from "../api/knowledge";

export default function KnowledgeOverview({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: "0 MB",
    fileTypes: {},
    recentUploads: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const files = await getFiles();
        if (files && Array.isArray(files)) {
          const totalFiles = files.length;

          // Count file types
          const fileTypes = {};
          files.forEach((file) => {
            const extension =
              file.fileName?.split(".").pop()?.toUpperCase() || "Unknown";
            fileTypes[extension] = (fileTypes[extension] || 0) + 1;
          }); // Count recent uploads (last 7 days)
          const sevenDaysAgo = moment().subtract(7, "days");
          const recentUploads = files.filter((file) => {
            if (!file.createdAt) return false;
            return moment(file.createdAt).isAfter(sevenDaysAgo);
          }).length;

          setStats({
            totalFiles,
            totalSize: "N/A", // Would need to implement size calculation
            fileTypes,
            recentUploads,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  const formatFileTypes = () => {
    return (
      Object.entries(stats.fileTypes)
        .map(([type, count]) => `${type}: ${count}`)
        .join(", ") || "None"
    );
  };

  return (
    <Container
      header={
        <Header variant="h2" description="Overview of your knowledge base">
          Knowledge Base Statistics
        </Header>
      }
    >
      <ColumnLayout columns={4} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Total Files</Box>
          <Box variant="awsui-value-large">{stats.totalFiles}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Recent Uploads</Box>
          <Box
            variant="awsui-value-large"
            color={
              stats.recentUploads > 0
                ? "text-status-success"
                : "text-body-secondary"
            }
          >
            {stats.recentUploads}
          </Box>
          <Box variant="small" color="text-body-secondary">
            Last 7 days
          </Box>
        </div>
        <div>
          <Box variant="awsui-key-label">File Types</Box>
          <Box variant="awsui-value-large">
            {Object.keys(stats.fileTypes).length}
          </Box>
          <Box variant="small" color="text-body-secondary">
            {formatFileTypes()}
          </Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Storage Used</Box>
          <Box variant="awsui-value-large">{stats.totalSize}</Box>
          <Box variant="small" color="text-body-secondary">
            Approximate
          </Box>
        </div>
      </ColumnLayout>
    </Container>
  );
}
