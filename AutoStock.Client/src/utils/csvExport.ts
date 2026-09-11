function escapeCsvValue(
    value: unknown
  ): string {
  
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }
  
  
    const stringValue =
      String(value);
  
  
    /*
     * Escape double quotes
     */
    const escapedValue =
      stringValue.replace(
        /"/g,
        '""'
      );
  
  
    /*
     * Wrap in quotes when needed
     */
    if (
      escapedValue.includes(",") ||
      escapedValue.includes('"') ||
      escapedValue.includes("\n") ||
      escapedValue.includes("\r")
    ) {
      return `"${escapedValue}"`;
    }
  
  
    return escapedValue;
  }
  
  
  export function exportToCsv<T>(
    fileName: string,
    rows: T[],
    columns: {
      header: string;
      value: (
        row: T
      ) => unknown;
    }[]
  ): void {
  
    if (
      rows.length === 0
    ) {
      throw new Error(
        "There is no data to export."
      );
    }
  
  
    /*
     * CSV Header
     */
    const headerRow =
      columns
        .map(
          column =>
            escapeCsvValue(
              column.header
            )
        )
        .join(",");
  
  
    /*
     * CSV Data
     */
    const dataRows =
      rows.map(
        row =>
          columns
            .map(
              column =>
                escapeCsvValue(
                  column.value(
                    row
                  )
                )
            )
            .join(",")
      );
  
  
    /*
     * UTF-8 BOM
     *
     * Helps Excel display
     * UTF-8 correctly.
     */
    const csvContent =
      "\uFEFF" +
      [
        headerRow,
        ...dataRows,
      ].join("\r\n");
  
  
    /*
     * Create File
     */
    const blob =
      new Blob(
        [
          csvContent,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );
  
  
    const url =
      URL.createObjectURL(
        blob
      );
  
  
    /*
     * Temporary Download Link
     */
    const link =
      document.createElement(
        "a"
      );
  
  
    link.href =
      url;
  
  
    link.download =
      fileName
        .toLowerCase()
        .endsWith(".csv")
        ? fileName
        : `${fileName}.csv`;
  
  
    document.body.appendChild(
      link
    );
  
  
    link.click();
  
  
    /*
     * Cleanup
     */
    document.body.removeChild(
      link
    );
  
  
    URL.revokeObjectURL(
      url
    );
  }