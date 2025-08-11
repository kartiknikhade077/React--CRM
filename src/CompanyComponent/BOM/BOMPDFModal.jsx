import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Document, Page, Text, View, PDFViewer } from "@react-pdf/renderer";
import { BOMPdfStyles } from "./BOMPdfStyles ";
import axiosInstance from "../../BaseComponet/axiosInstance";

const MyDocument = ({ bomId, bomInfo, bomInfoCategory }) => {
  const groupedData = bomInfoCategory.reduce((acc, item) => {
    if (!acc[item.bomCategory]) {
      acc[item.bomCategory] = [];
    }
    acc[item.bomCategory].push(item);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={BOMPdfStyles.page}>
        <Text style={BOMPdfStyles.title}>BOM PDF</Text>
        <Text style={BOMPdfStyles.text}>BOM ID: {bomId}</Text>

        {/* Header Table */}
        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.col}><Text>BILL OF MATERIALS</Text></View>
          <View style={BOMPdfStyles.col}><Text>W.O. NO -</Text></View>
          <View style={BOMPdfStyles.colLast}><Text>{bomInfo.workOrderNo}</Text></View>
        </View>

        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.colNoTop}>
            <Text style={BOMPdfStyles.smallText}>PART DETAILS: {bomInfo.partName}</Text>
          </View>
          <View style={BOMPdfStyles.colNoTopLast}>
            <Text style={BOMPdfStyles.smallText}>DIE DETAILS: {bomInfo.dieDetails}</Text>
          </View>
        </View>

        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.colNoTop}>
            <Text style={BOMPdfStyles.smallText}>PROJECT DETAIL: {bomInfo.projectDetails}</Text>
          </View>
          <View style={BOMPdfStyles.colNoTopLast}>
            <Text style={BOMPdfStyles.smallText}>
              DATE & REV NO: {bomInfo.bomDate} {bomInfo.revisionNumber}
            </Text>
          </View>
        </View>

        {/* Grouped BOM Tables */}
        {Object.entries(groupedData).map(([category, items]) => (
          <View key={category} style={{ marginTop: 10 }}>
            {/* Category Heading */}
            <Text style={BOMPdfStyles.categoryTextHeading}>{category}</Text>

            {/* Table Header */}
      <View style={BOMPdfStyles.tableRow}>
  <Text style={[BOMPdfStyles.tableHeader, BOMPdfStyles.tableHeaderFirst]}>Item No</Text>
  <Text style={BOMPdfStyles.tableHeader}>Description</Text>
  <Text style={BOMPdfStyles.tableHeader}>Material</Text>
  <Text style={BOMPdfStyles.tableHeader}>Finish H</Text>
  <Text style={BOMPdfStyles.tableHeader}>Finish L</Text>
  <Text style={[BOMPdfStyles.tableHeader, BOMPdfStyles.tableHeaderLast]}>Finish W</Text>
</View>

{items.map((item) => (
  <View key={item.bomcategoryInfoId} style={BOMPdfStyles.tableRow}>
    <Text style={[BOMPdfStyles.tableCell, BOMPdfStyles.tableCellFirst]}>{item.itemNo}</Text>
    <Text style={BOMPdfStyles.tableCell}>{item.itemDescription || "-"}</Text>
    <Text style={BOMPdfStyles.tableCell}>{item.matl || "-"}</Text>
    <Text style={BOMPdfStyles.tableCell}>{item.finishSizeHeight}</Text>
    <Text style={BOMPdfStyles.tableCell}>{item.finishSizeLength}</Text>
    <Text style={[BOMPdfStyles.tableCell, BOMPdfStyles.tableCellLast]}>{item.finishSizeWidth}</Text>
  </View>
))}

          </View>
        ))}
      </Page>
    </Document>
  );
};


export default function BOMPDFModal({ show, onClose, bomId }) {
  const [bomInfo, setBOMInfo] = useState({});
  const [bomInfoCategory, setBOMInfoCategory] = useState([]);

  useEffect(() => {
    if (bomId) {
      fetchBOMInfoWithCategory();
    }
  }, [bomId]);

  const fetchBOMInfoWithCategory = async () => {
    try {
      console.log("Fetching BOM with ID:", bomId);
      const response = await axiosInstance.get(`kickoff/getBOMInfoById/${bomId}`);
      console.log("BOM Data:", response.data);

      setBOMInfo(response.data.BOMInfo || {});
      setBOMInfoCategory(response.data.BOMInfoCategory || []);
    } catch (error) {
      console.error("Error fetching BOM:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Body style={{ height: "80vh" }}>
        <PDFViewer width="100%" height="100%">
          <MyDocument
            bomId={bomId}
            bomInfo={bomInfo}
            bomInfoCategory={bomInfoCategory}
          />
        </PDFViewer>
      </Modal.Body>
    </Modal>
  );
}

