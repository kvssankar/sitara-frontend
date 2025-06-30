import React, { useEffect, useState, useCallback } from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import { deleteTool, getTools } from "../api/tools";
import CreateToolModal from "./ToolFormModal";
import moment from "moment";

export default function ToolsTable({ flashMessages, setFlashMessages }) {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteringText, setFilteringText] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState({
    field: null,
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTools();
      console.log(data);
      if (data) setItems(data);
    } catch (error) {
      setFlashMessages([
        ...flashMessages,
        {
          type: "error",
          dismissible: true,
          content: "Failed to load tools. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [flashMessages, setFlashMessages]);
  useEffect(() => {
    fetchData();
    console.log("flashMessages");
  }, [fetchData]);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      alert("Delete tools has been disabled for demo purposes.");
      return;
      for (const item of selectedItems) {
        // await deleteTool(item.name);
      }
      const updatedItems = items?.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
      );
      setItems(updatedItems);
      setSelectedItems([]);
      setFlashMessages([
        ...flashMessages,
        {
          type: "success",
          dismissible: true,
          content: "Selected tools deleted successfully.",
        },
      ]);
    } catch (error) {
      setFlashMessages([
        ...flashMessages,
        {
          type: "error",
          dismissible: true,
          content: "Failed to delete tools. Please try again.",
        },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  // Filter items based on filteringText
  const filteredItems = items?.filter((item) =>
    item.name?.toLowerCase().includes(filteringText.toLowerCase())
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

  return (
    <Table
      renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) =>
        `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
      }
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: () => "Select all",
        itemSelectionLabel: ({ selectedItems }, item) => item.name,
      }}
      columnDefinitions={[
        {
          id: "name",
          header: "Tool name",
          cell: (e) => e.name,
          sortingField: "name",
          isRowHeader: true,
        },
        {
          id: "description",
          header: "Description",
          cell: (e) => e.description,
          sortingField: "description",
        },
        {
          id: "createdDate",
          header: "Created Date",
          cell: (e) => moment(e.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
          sortingField: "createdDate",
        },
        {
          id: "updatedDate",
          header: "Updated Date",
          cell: (e) => moment(e.updatedAt).format("MMMM Do YYYY, h:mm:ss a"),
          sortingField: "updatedDate",
        },
      ]}
      columnDisplay={[
        { id: "name", visible: true },
        { id: "description", visible: true },
        { id: "createdDate", visible: true },
        { id: "updatedDate", visible: true },
      ]}
      sortingColumn={sortConfig.field}
      sortingDescending={sortConfig.direction === "desc"}
      onSortingChange={({ detail }) =>
        setSortConfig({
          field: detail.sortingColumn,
          direction: detail.isDescending ? "desc" : "asc",
        })
      }
      enableKeyboardNavigation
      items={sortedItems}
      loading={loading}
      loadingText="Loading tools..."
      selectionType="multi"
      stripedRows
      trackBy="name"
      wrapLines
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="m">
            <b>No tools available</b>

            <CreateToolModal
              setFlashMessages={setFlashMessages}
              onSuccess={fetchData}
            />
          </SpaceBetween>
        </Box>
      }
      filter={
        <TextFilter
          filteringPlaceholder="Find tools"
          filteringText={filteringText}
          onChange={({ detail }) => setFilteringText(detail.filteringText)}
        />
      }
      header={
        <Header
          counter={
            selectedItems.length ? "(" + selectedItems.length + ")" : null
          }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={handleDelete}
                disabled={selectedItems.length === 0 || deleting}
                loading={deleting}
              >
                Delete Selected
              </Button>{" "}
              <CreateToolModal
                isEdit={true}
                tool={selectedItems[0]}
                setFlashMessages={setFlashMessages}
                onSuccess={fetchData}
              />
              <CreateToolModal
                setFlashMessages={setFlashMessages}
                onSuccess={fetchData}
              />
            </SpaceBetween>
          }
        >
          Files
        </Header>
      }
      pagination={<Pagination currentPageIndex={1} pagesCount={1} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={{
            pageSize: 10,
            contentDisplay: [
              { id: "name", visible: true },
              { id: "description", visible: true },
              { id: "createdDate", visible: true },
              { id: "updatedDate", visible: true },
            ],
          }}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 tools" },
              { value: 20, label: "20 tools" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              { id: "name", label: "Tool name", alwaysVisible: true },
              { id: "description", label: "Description" },
              { id: "createdDate", label: "Created Date" },
              { id: "updatedDate", label: "Updated Date" },
            ],
          }}
        />
      }
    />
  );
}
