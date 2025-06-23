// src/components/SupportCasesTable.js
import React, { useState, useEffect } from "react";
import {
  Table,
  Box,
  Button,
  SpaceBetween,
  Badge,
  Link,
  TextFilter,
  Header,
  Pagination,
  CollectionPreferences,
} from "@cloudscape-design/components";
import { getSupportCases } from "../api/support";
import { useNavigate } from "react-router-dom";

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

export default function SupportCasesTable() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteringText, setFilteringText] = useState("");
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await getSupportCases();
      setCases(response || []);
    } catch (error) {
      console.error("Error loading support cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (item) =>
      item.title?.toLowerCase().includes(filteringText.toLowerCase()) ||
      item.caseId?.toLowerCase().includes(filteringText.toLowerCase()) ||
      item.status?.toLowerCase().includes(filteringText.toLowerCase())
  );

  const handleRowClick = (caseId) => {
    navigate(`/support/cases/${caseId}/chat`);
  };

  const columnDefinitions = [
    {
      id: "caseId",
      header: "Case ID",
      cell: (item) => (
        <Link onFollow={() => handleRowClick(item.caseId)}>{item.caseId}</Link>
      ),
      sortingField: "caseId",
      minWidth: 150,
    },
    {
      id: "title",
      header: "Title",
      cell: (item) => item.title,
      sortingField: "title",
      minWidth: 200,
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <Badge color={STATUS_COLORS[item.status] || "grey"}>
          {item.status}
        </Badge>
      ),
      sortingField: "status",
      minWidth: 100,
    },
    {
      id: "priority",
      header: "Priority",
      cell: (item) => (
        <Badge color={PRIORITY_COLORS[item.priority] || "grey"}>
          {item.priority}
        </Badge>
      ),
      sortingField: "priority",
      minWidth: 100,
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (item) => new Date(item.createdAt).toLocaleDateString(),
      sortingField: "createdAt",
      minWidth: 120,
    },
    {
      id: "updatedAt",
      header: "Last Updated",
      cell: (item) => new Date(item.updatedAt).toLocaleDateString(),
      sortingField: "updatedAt",
      minWidth: 120,
    },
  ];

  return (
    <Table
      columnDefinitions={columnDefinitions}
      items={filteredCases}
      loading={loading}
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectionType="multi"
      trackBy="caseId"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No support cases</b>
          <Box variant="p" color="inherit">
            No support cases found.
          </Box>
        </Box>
      }
      filter={
        <TextFilter
          filteringText={filteringText}
          onFilteringTextChange={({ detail }) =>
            setFilteringText(detail.filteringText)
          }
          filteringPlaceholder="Find cases..."
        />
      }
      header={
        <Header
          counter={`(${cases.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={loadCases} iconName="refresh">
                Refresh
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/support/create-case")}
              >
                Create Case
              </Button>
            </SpaceBetween>
          }
        >
          Support Cases
        </Header>
      }
      pagination={
        <Pagination
          currentPageIndex={currentPageIndex}
          onChange={({ detail }) =>
            setCurrentPageIndex(detail.currentPageIndex)
          }
          pagesCount={Math.ceil(filteredCases.length / 10)}
          ariaLabels={{
            nextPageLabel: "Next page",
            previousPageLabel: "Previous page",
            pageLabel: (pageNumber) => `Page ${pageNumber} of all pages`,
          }}
        />
      }
    />
  );
}
