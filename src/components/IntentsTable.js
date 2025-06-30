import React, { useEffect, useState, useCallback } from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import IntentFormModal from "./IntentFormModal";
import { deleteIntent, getIntents } from "../api/intents";
import moment from "moment";

export default function IntentsTable({ setFlashMessages }) {
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
      const data = await getIntents();
      if (data) setItems(data);
    } catch (error) {
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Failed to load intents. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [setFlashMessages]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      alert("Delete intents has been disabled for demo purposes.");
      return;
      for (const item of selectedItems) {
        // await deleteIntent(item.intentid);
      }
      const updatedItems = items?.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
      );
      setItems(updatedItems);
      setSelectedItems([]);
      setFlashMessages([
        {
          type: "success",
          dismissible: true,
          content: "Selected intents deleted successfully.",
        },
      ]);
    } catch (error) {
      setFlashMessages([
        {
          type: "error",
          dismissible: true,
          content: "Failed to delete intents. Please try again.",
        },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  // Filter items based on filteringText
  const filteredItems = items?.filter(
    (item) =>
      item.intent?.toLowerCase().includes(filteringText.toLowerCase()) ||
      item.steps?.toLowerCase().includes(filteringText.toLowerCase())
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
  const onFormSubmit = () => {
    fetchData();
  };

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
        itemSelectionLabel: ({ selectedItems }, item) => item.intent,
      }}
      columnDefinitions={[
        {
          id: "intent",
          header: "Topic Name",
          cell: (e) => e.intent,
          sortingField: "intent",
          isRowHeader: true,
        },
        {
          id: "steps",
          header: "Steps",
          cell: (e) => e.steps,
          sortingField: "steps",
        },
        {
          id: "createdDate",
          header: "Created Date",
          cell: (e) => moment(e.createdDate).format("MMMM Do YYYY, h:mm:ss a"),
          sortingField: "createdDate",
        },
        {
          id: "updatedDate",
          header: "Updated Date",
          cell: (e) => moment(e.updatedDate).format("MMMM Do YYYY, h:mm:ss a"),
          sortingField: "updatedDate",
        },
      ]}
      columnDisplay={[
        { id: "intent", visible: true },
        { id: "steps", visible: true },
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
      loadingText="Loading topics"
      selectionType="multi"
      stripedRows
      trackBy="intent"
      wrapLines
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="m">
            <b>No topics available</b>
            <IntentFormModal
              setFlashMessages={setFlashMessages}
              onFormSubmit={onFormSubmit}
            />
          </SpaceBetween>
        </Box>
      }
      filter={
        <TextFilter
          filteringPlaceholder="Find topics"
          filteringText={filteringText}
          onChange={({ detail }) => setFilteringText(detail.filteringText)}
        />
      }
      header={
        <Header
          counter={
            selectedItems.length
              ? "(" + selectedItems.length + "/" + items?.length
              : `(${items?.length})`
          }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={handleDelete}
                disabled={selectedItems.length === 0 || deleting}
                loading={deleting}
              >
                Delete Selected
              </Button>
              <IntentFormModal
                isEdit={true}
                intent={selectedItems[0]}
                setFlashMessages={setFlashMessages}
                onFormSubmit={onFormSubmit}
              />
              <IntentFormModal
                setFlashMessages={setFlashMessages}
                onFormSubmit={onFormSubmit}
              />
            </SpaceBetween>
          }
        >
          Topics
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
              { id: "intent", visible: true },
              { id: "steps", visible: true },
              { id: "createdDate", visible: true },
              { id: "updatedDate", visible: true },
            ],
          }}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 topics" },
              { value: 20, label: "20 topics" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              { id: "intent", label: "Topic Name", alwaysVisible: true },
              { id: "steps", label: "Steps" },
              { id: "createdDate", label: "Created Date" },
              { id: "updatedDate", label: "Updated Date" },
            ],
          }}
        />
      }
    />
  );
}
