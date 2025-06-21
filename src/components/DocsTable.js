import React, { useEffect, useState } from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import { deleteFile, getFiles } from "../api/knowledge";

export default function DocsTable({flashMessages}) {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filteringText, setFilteringText] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState({
    field: null,
    direction: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFiles();
      console.log(data);
      if (data) setItems(data);
    };
    fetchData();
    console.log("flashMessages");
  }, [flashMessages]);

  const handleDelete = async () => {
    for (const item of selectedItems) {
      await deleteFile(item.fileName);
    }
    const updatedItems = items?.filter(
      (item) => !selectedItems.some((selected) => selected.id === item.id)
    );
    setItems(updatedItems);
    setSelectedItems([]);
  };

  // Filter items based on filteringText
  const filteredItems = items?.filter(
    (item) =>
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
        itemSelectionLabel: ({ selectedItems }, item) => item.fileName,
      }}
      columnDefinitions={[
        {
          id: "fileName",
          header: "File Name",
          cell: (e) => e.fileName,
          sortingField: "fileName",
          isRowHeader: true,
        },
        {
          id: "url",
          header: "Url",
          cell: (e) => e.url,
          sortingField: "url",
        },
        {
          id: "createdDate",
          header: "Created Date",
          cell: (e) => e.createdDate,
          sortingField: "createdDate",
        },
        {
          id: "updatedDate",
          header: "Updated Date",
          cell: (e) => e.updatedDate,
          sortingField: "updatedDate",
        },
      ]}
      columnDisplay={[
        { id: "fileName", visible: true },
        { id: "url", visible: true },
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
      loadingText="Loading files..."
      selectionType="multi"
      stripedRows
      trackBy="fileName"
      wrapLines
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="m">
            <b>No files available</b>
            {/* <IntentFormModal onFormSubmit={setItems} /> */}
          </SpaceBetween>
        </Box>
      }
      filter={
        <TextFilter
          filteringPlaceholder="Find files"
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
                disabled={selectedItems.length === 0}
              >
                Delete Selected
              </Button>
              {/* <IntentFormModal
                onFormSubmit={(newIntent) => setItems([...items, newIntent])}
              /> */}
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
              { id: "fileName", visible: true },
              { id: "url", visible: true },
              { id: "createdDate", visible: true },
              { id: "updatedDate", visible: true },
            ],
          }}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 files" },
              { value: 20, label: "20 files" },
            ],
          }}
          wrapLinesPreference={{}}
          stripedRowsPreference={{}}
          contentDensityPreference={{}}
          contentDisplayPreference={{
            options: [
              { id: "fileName", label: "File Name", alwaysVisible: true },
              { id: "url", label: "Url" },
              { id: "createdDate", label: "Created Date" },
              { id: "updatedDate", label: "Updated Date" },
            ],
          }}
        />
      }
    />
  );
}
