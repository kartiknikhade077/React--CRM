import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Document, Page, Text, View, PDFViewer,Image   } from "@react-pdf/renderer";
import { BOMPdfStyles } from "./BOMPdfStyles ";
import axiosInstance from "../../BaseComponet/axiosInstance";


const renderCellContent = (colName, item) => {
  switch (colName) {
    case "ITEM NO":
      return item.itemNo || "-";
    case "ITEM DESCRIPTION":
      return item.itemDescription || "-";
    case "MATL":
      return item.matl || "-";
    case "FINISH SIZE":
      // format your finish size columns as needed
      return `${item.finishSizeHeight || "-"} x ${item.finishSizeLength || "-"} x ${item.finishSizeWidth || "-"}`;
    case "RAW SIZE":
      return `${item.rawSizeHeight || "-"} x ${item.rawSizeLength || "-"} x ${item.rawSizeWidth || "-"}`;
    case "QTY":
      return item.quantity || "-";
    case "REMARKS":
      return item.remarks || "-";
    case "MODEL WT":
      return item.modelWeight || "-";
    case "ORDERING REMARKS":
      return item.orderingRemarks || "-";
    case "BOUGHT OUT ITEMS":
      return item.boughtOutItems || "-";
    case "BOUGHT OUT QTY":
      return item.boughtOutQuantity || "-";
    case "SPECIFICATION":
      return item.specification || "-";
    case "SEC.":
      return item.section || "-";
    default:
      return "-";
  }
};


const MyDocument = ({ bomId, bomInfo, bomInfoCategory, bomCategoriesAndItems, companyInfo }) => {
  const groupedData = bomInfoCategory.reduce((acc, item) => {
    if (!acc[item.bomCategory]) {
      acc[item.bomCategory] = [];
    }
    acc[item.bomCategory].push(item);
    return acc;
  }, {});

    // Build base64 image URL
  const logoSrc = companyInfo?.mainLogo
    ? `data:image/jpeg;base64,${companyInfo.mainLogo}`
    : null;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={BOMPdfStyles.page}>

      <View style={{ flexDirection: "row", alignItems: "center",borderLeft:"1pt solid #000",borderTop:"1pt solid #000" ,borderRight:"1pt solid #000"}}>
  
  {/* Left: Company Logo */}
  <View style={{ flex: 1, alignItems: "flex-start" }}>
    <Image
      src={logoSrc}
      style={{ width: 100, height: 100 }} // Adjust size as needed
    />
  </View>

  {/* Center: Company Info */}
  <View style={{ flex: 3, alignItems: "center" }}>
    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
      PLANETTO TOOLTECH PVT. LTD.
    </Text>
    <Text style={{ fontSize: 10, textAlign: "center" }}>
      Plot No.PAP-A24, Phase-IV, MIDC Chakan, Behind Mahindra & Mahindra,
      Nighoje, Pune-410501
    </Text>
    <Text style={{ fontSize: 10, textAlign: "center" }}>
      Ph: +91 9850624952, Contact: director@Planetto.co.in
    </Text>
  </View>

  {/* Right: Empty space (optional, for balance) */}
  <View style={{ flex: 1 }} />
</View>

        {/* Header Table */}
        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.col}><Text>BILL OF MATERIALS</Text></View>
          <View style={BOMPdfStyles.col}><Text>W.O. NO -</Text></View>
          <View style={BOMPdfStyles.colLast}><Text>{bomInfo.workOrderNo}</Text></View>
        </View>

        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.colNoTop}>
            <Text style={BOMPdfStyles.smallText}> PART DETAILS: {bomInfo.partName}</Text>
          </View>
          <View style={BOMPdfStyles.colNoTopLast}>
            <Text style={BOMPdfStyles.smallText}>  DETAILS: {bomInfo.dieDetails}</Text>
          </View>
        </View>

        <View style={BOMPdfStyles.row}>
          <View style={BOMPdfStyles.colNoTop}>
            <Text style={BOMPdfStyles.smallText}> PROJECT DETAIL: {bomInfo.projectDetails}</Text>
          </View>
          <View style={BOMPdfStyles.colNoTopLast}>
            <Text style={BOMPdfStyles.smallText}>  DATE & REV NO: {bomInfo.bomDate} {bomInfo.revisionNumber} </Text>
          </View>
        </View>

        {/* Grouped BOM Tables */}
        {Object.entries(groupedData).map(([category, items]) => {
          const configuredColumns = bomCategoriesAndItems[category] || [];

          // Only show columns that have at least one non-empty value in items
          const columnsToShow = configuredColumns.filter(colName =>
            items.some(item => {
              const val = renderCellContent(colName, item);
              return val !== "-" && val !== null && val !== undefined && val !== "";
            })
          );

          if (columnsToShow.length === 0) {
            // No columns with data - skip rendering this category
            return null;
          }

          return (
            <View key={category}>
              <Text style={BOMPdfStyles.categoryTextHeading}>{category}</Text>

              {/* Table header */}
              <View style={BOMPdfStyles.tableRow}>
                {columnsToShow.map((colName, index) => (
                  <Text
                    key={colName}
                    style={[
                      BOMPdfStyles.tableHeader,
                      index === 0 ? BOMPdfStyles.tableHeaderFirst : null,
                      index === columnsToShow.length - 1 ? BOMPdfStyles.tableHeaderLast : null,
                    ]}
                  >
                    {colName}
                  </Text>
                ))}
              </View>

              {/* Table rows */}
              {items.map(item => (
                <View key={item.bomcategoryInfoId} style={BOMPdfStyles.tableRow} wrap={false}>
                  {columnsToShow.map((colName, index) => (
                    <Text
                      key={colName}
                      style={[
                        BOMPdfStyles.tableCell,
                        index === 0 ? BOMPdfStyles.tableCellFirst : null,
                        index === columnsToShow.length - 1 ? BOMPdfStyles.tableCellLast : null,
                      ]}
                    >
                      {renderCellContent(colName, item)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};


export default function BOMPDFModal({ show, onClose, bomId }) {
  const [bomInfo, setBOMInfo] = useState({});
  const [bomInfoCategory, setBOMInfoCategory] = useState([]);
  const [bomCategoriesAndItems, setbomCategoriesAndItems] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([])

  useEffect(() => {
    if (bomId) {
      fetchBOMInfoWithCategory();
    }
  }, [bomId]);

  const fetchBOMInfoWithCategory = async () => {
    try {

      const response = await axiosInstance.get(`kickoff/getBOMInfoById/${bomId}`);
      setBOMInfo(response.data.BOMInfo || {});
      setBOMInfoCategory(response.data.BOMInfoCategory || []);

      const categoryResponse = await axiosInstance.get(`kickoff/getCategoryByCompanyId`);
      setbomCategoriesAndItems(categoryResponse.data);

      const companyInfo = await axiosInstance.get('company/getCompanyInfo')
      setCompanyInfo(companyInfo.data)
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
            bomCategoriesAndItems={bomCategoriesAndItems}
            companyInfo={companyInfo}
          />
        </PDFViewer>
      </Modal.Body>
    </Modal>
  );
}

