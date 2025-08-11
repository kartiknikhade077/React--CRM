import React from "react";
import { Page, Text, Document, PDFViewer } from "@react-pdf/renderer";

// Simple PDF document
const BOMPdf = () => (
  <Document>
    <Page size="A4">
      <Text>Hello, this is a simple PDF document!</Text>
    </Page>
  </Document>
);

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <MyDocument />
      </PDFViewer>
    </div>
  );
}
