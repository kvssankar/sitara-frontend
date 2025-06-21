import React, { useEffect, useState, useMemo, useCallback } from "react";
import moment from "moment";
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Header,
  Pagination,
  CollectionPreferences,
  Container,
  Modal,
  Alert,
  Link,
} from "@cloudscape-design/components";
import { deleteFile, getFiles } from "../api/knowledge";

export default function KnowledgeFilesTable({
  refreshTrigger,
  setFlashMessages,
}) {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteringText, setFilteringText] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: "fileName",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await getFiles();
      if (data && Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      for (const item of selectedItems) {
        await deleteFile(item.fileName);
      }

      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: `Successfully deleted ${selectedItems.length} file(s)`,
          id: "delete_success",
          onDismiss: () => setFlashMessages([]),
        },
      ]);

      await fetchFiles();
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting files:", error);
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Failed to delete files. Please try again.",
          id: "delete_error",
          onDismiss: () => setFlashMessages([]),
        },
      ]);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Filter items based on filteringText
  const filteredItems = items.filter((item) =>
    item.fileName?.toLowerCase().includes(filteringText.toLowerCase())
  );

  // Sort items based on sortConfig
  const sortedItems = React.useMemo(() => {
    if (sortConfig.field) {
      return [...filteredItems].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filteredItems;
  }, [filteredItems, sortConfig]);

  // Pagination
  const startIndex = (currentPageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const momentDate = moment(dateString);
      return (
        <div>
          <div>{momentDate.format("MMM DD, YYYY [at] h:mm A")}</div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
            {momentDate.fromNow()}
          </div>
        </div>
      );
    } catch {
      return dateString;
    }
  }, []);
  const getFileSize = useCallback((url) => {
    // This is a placeholder - you might want to implement actual file size retrieval
    return "N/A";
  }, []);

  const columnDefinitions = useMemo(
    () => [
      {
        id: "fileName",
        header: "File Name",
        cell: (item) => (
          <Link external href={item.url} target="_blank">
            {item.fileName}
          </Link>
        ),
        sortingField: "fileName",
        isRowHeader: true,
      },
      {
        id: "fileType",
        header: "Type",
        cell: (item) => {
          const extension =
            item.fileName?.split(".").pop()?.toUpperCase() || "Unknown";
          return extension;
        },
        sortingField: "fileType",
      },
      {
        id: "size",
        header: "Size",
        cell: (item) => getFileSize(item.url),
        sortingField: "size",
      },
      {
        id: "createdDate",
        header: "Upload Date",
        cell: (item) => formatDate(item.createdAt),
        sortingField: "createdAt",
      },
      {
        id: "updatedDate",
        header: "Last Modified",
        cell: (item) => formatDate(item.updatedAt),
        sortingField: "updatedAt",
      },
    ],
    [formatDate, getFileSize]
  );

  return (
    <>
      <Container
        header={
          <Header
            variant="h2"
            description="Manage your uploaded documents"
            counter={`(${sortedItems.length})`}
          >
            Knowledge Base Files
          </Header>
        }
      >
        <Table
          renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
            `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
          }
          onSelectionChange={({ detail }) =>
            setSelectedItems(detail.selectedItems)
          }
          selectedItems={selectedItems}
          ariaLabels={{
            selectionGroupLabel: "Items selection",
            allItemsSelectionLabel: () => "Select all",
            itemSelectionLabel: ({ selectedItems }, item) => item.fileName,
          }}
          columnDefinitions={columnDefinitions}
          columnDisplay={[
            { id: "fileName", visible: true },
            { id: "fileType", visible: true },
            { id: "size", visible: true },
            { id: "createdDate", visible: true },
            { id: "updatedDate", visible: true },
          ]}
          sortingColumn={sortConfig.field}
          sortingDescending={sortConfig.direction === "desc"}
          onSortingChange={({ detail }) =>
            setSortConfig({
              field: detail.sortingColumn.sortingField,
              direction: detail.isDescending ? "desc" : "asc",
            })
          }
          enableKeyboardNavigation
          items={paginatedItems}
          loadingText="Loading files..."
          loading={loading}
          selectionType="multi"
          stripedRows
          trackBy="fileName"
          wrapLines
          empty={
            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No files found</b>
                <p>
                  Upload your first document to get started with your knowledge
                  base.
                </p>
              </SpaceBetween>
            </Box>
          }
          filter={
            <TextFilter
              filteringPlaceholder="Search files by name..."
              filteringText={filteringText}
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
              countText={`${sortedItems.length} match${
                sortedItems.length === 1 ? "" : "es"
              }`}
            />
          }
          header={
            <Header
              counter={
                selectedItems.length
                  ? `(${selectedItems.length} selected)`
                  : null
              }
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    onClick={() => fetchFiles()}
                    iconName="refresh"
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={selectedItems.length === 0}
                    variant="normal"
                  >
                    Delete Selected ({selectedItems.length})
                  </Button>
                </SpaceBetween>
              }
            >
              Files
            </Header>
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              pagesCount={totalPages}
              onChange={({ detail }) =>
                setCurrentPageIndex(detail.currentPageIndex)
              }
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={{
                pageSize: pageSize,
                contentDisplay: [
                  { id: "fileName", visible: true },
                  { id: "fileType", visible: true },
                  { id: "size", visible: true },
                  { id: "createdDate", visible: true },
                  { id: "updatedDate", visible: true },
                ],
              }}
              pageSizePreference={{
                title: "Page size",
                options: [
                  { value: 5, label: "5 files" },
                  { value: 10, label: "10 files" },
                  { value: 20, label: "20 files" },
                  { value: 50, label: "50 files" },
                ],
              }}
              onConfirm={({ detail }) => {
                setPageSize(detail.pageSize);
                setCurrentPageIndex(1);
              }}
              wrapLinesPreference={{}}
              stripedRowsPreference={{}}
              contentDensityPreference={{}}
              contentDisplayPreference={{
                options: [
                  { id: "fileName", label: "File Name", alwaysVisible: true },
                  { id: "fileType", label: "Type" },
                  { id: "size", label: "Size" },
                  { id: "createdDate", label: "Upload Date" },
                  { id: "updatedDate", label: "Last Modified" },
                ],
              }}
            />
          }
        />
      </Container>

      <Modal
        onDismiss={() => setShowDeleteModal(false)}
        visible={showDeleteModal}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                loading={loading}
              >
                Delete {selectedItems.length} file
                {selectedItems.length !== 1 ? "s" : ""}
              </Button>
            </SpaceBetween>
          </Box>
        }
        header="Delete Files"
      >
        <SpaceBetween size="m">
          <Alert type="warning">
            Are you sure you want to delete the selected {selectedItems.length}{" "}
            file{selectedItems.length !== 1 ? "s" : ""}? This action cannot be
            undone.
          </Alert>
          <Box>
            <strong>Files to be deleted:</strong>
            <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
              {selectedItems.map((item, index) => (
                <li key={index}>{item.fileName}</li>
              ))}
            </ul>
          </Box>
        </SpaceBetween>
      </Modal>
    </>
  );
}
