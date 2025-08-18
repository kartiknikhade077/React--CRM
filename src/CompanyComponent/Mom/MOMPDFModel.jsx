import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Document, Page, Text, View, PDFViewer, Image } from "@react-pdf/renderer";
import { MOMPdfStyles } from "./MOMPdfStyles";
import axiosInstance from "../../BaseComponet/axiosInstance";

// PDF Content
const MyDocument = ({ momData, momEntries, workOrder, workOrderItemProcess }) => {

  const momInfo = momData.momInfo
  const momEntriesData = momEntries
  const workOrderInfo = workOrder
  const workOrderItemProcessData = workOrderItemProcess;

  // Group by workOrderNo
  const groupedEntries = momEntriesData.reduce((acc, entry) => {
    if (!entry.workOrderNo) return acc;
    if (!acc[entry.workOrderNo]) acc[entry.workOrderNo] = [];
    acc[entry.workOrderNo].push(entry);
    return acc;
  }, {});

  // Map workOrderItemProcess by workOrderNo
  const workOrderProcessMap = workOrderItemProcessData.reduce((acc, item) => {
    if (!item.workOrderNo) return acc;
    acc[item.workOrderNo] = {
      operationNumber: item.operationNumber,
      process: item.proceess
    };
    return acc;
  }, {});

  // Map tool name by workOrderNo (take first non-empty one)
  const toolNameMap = momEntriesData.reduce((acc, entry) => {
    if (!entry.workOrderNo) return acc;
    if (!acc[entry.workOrderNo] && entry.tooleName?.trim()) {
      acc[entry.workOrderNo] = entry.tooleName;
    }
    return acc;
  }, {});



  return (
    <Document>
      <Page size="A4" orientation="landscape" style={MOMPdfStyles.page}>
        {/* Row 1 */}
        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.titleCellHeading}> MOM-{workOrderInfo.partNumber}_{workOrderInfo.partName} Dies DAP MOM SHEET</Text>
        </View>
        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.titleCellLeft}> Project :{momInfo.projectName}</Text>
          <Text style={MOMPdfStyles.titleCell}> Venue : {momInfo.venue}</Text>
          <Text style={MOMPdfStyles.titleCell}> Date : {momInfo.createdDate} </Text>

        </View>
        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.infoCell} > {momInfo.customerName}</Text>


          <Text style={MOMPdfStyles.infoCell}> Plentto ToolTech(PT)</Text>
        </View>

        {/* Data Rows */}
        <View style={MOMPdfStyles.row}>
          {/* Customer Serial No column */}
          <View style={MOMPdfStyles.column}>
            {momInfo.contactPersonName.split(",").map((_, index) => (
              <Text key={index} style={MOMPdfStyles.cellText}>{index + 1}</Text>
            ))}
          </View>

          {/* Contact Person column */}
          <View style={MOMPdfStyles.column}>
            {momInfo.contactPersonName.split(",").map((name, index) => (
              <Text key={index} style={MOMPdfStyles.cellText}>{name.trim()}</Text>
            ))}
          </View>

          {/* Employee Serial No column */}
          <View style={MOMPdfStyles.column}>
            {momInfo.employeeName.split(",").map((_, index) => (
              <Text key={index} style={MOMPdfStyles.cellText}>{index + 1}</Text>
            ))}
          </View>

          {/* Employee Name column */}
          <View style={MOMPdfStyles.column}>
            {momInfo.employeeName.split(",").map((name, index) => (
              <Text key={index} style={MOMPdfStyles.lastNamecolumn}>{name.trim()}</Text>
            ))}
          </View>
        </View>

        <View style={MOMPdfStyles.row}>

          <Text style={MOMPdfStyles.customerSerialNo} ></Text>
          <Text style={MOMPdfStyles.infoCell}> {momInfo.thirdCompany}</Text>

        </View>

        {momInfo.thirdPersonCompany.split(",").map((name, index) => (
          <View style={MOMPdfStyles.row} key={index}>
            <Text style={MOMPdfStyles.thirdPartyBlankCell}></Text>
            <Text style={MOMPdfStyles.OtherthirdPartyBlankCell}></Text>
            <Text style={MOMPdfStyles.thidPartySerialNo}>{index + 1}</Text>
            <Text style={MOMPdfStyles.thidPartyCustomerName}>{name.trim()}</Text>
          </View>
        ))}

        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.intoducntionCell} > Introduction :
            <Text style={MOMPdfStyles.introductionText} >{momInfo.introduction}</Text>
          </Text>



        </View>


        Mom entries

        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.momEntriesHeader} >#</Text>
          <Text style={MOMPdfStyles.momEntriesHeader} >Observation</Text>
          <Text style={MOMPdfStyles.momEntriesHeader}  >Detail/Action Plan</Text>
          <Text style={MOMPdfStyles.momEntriesHeader}  >Illustration</Text>
          <Text style={MOMPdfStyles.momEntriesHeader}  >Corrected Image</Text>
          <Text style={MOMPdfStyles.momEntriesHeader} >Corrected Points</Text>
          <Text style={MOMPdfStyles.momEntriesHeader} >Responsible & Target</Text>
        </View>



        {Object.keys(groupedEntries).map((workOrderNo) => {
          const toolName = toolNameMap[workOrderNo] || "No Tool Name";
          const processInfo = workOrderProcessMap[workOrderNo] || {};

          return (
            <View key={workOrderNo}>
              {/* Work order header with tool name */}
              <View style={MOMPdfStyles.row}>
                <Text style={MOMPdfStyles.workOrderHeader}>
                  {workOrderInfo.partName} _ {workOrderNo} _ {toolName}
                </Text>
              </View>

              {/* Operation number and process */}
              <View style={MOMPdfStyles.row}>
                <Text style={MOMPdfStyles.workOrderHeader}>
                  OP-{processInfo.operationNumber}({processInfo.process || "N/A"})
                </Text>
              </View>

              <View style={MOMPdfStyles.row}>
               <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}> Die Size</Text>.
                <Text style={MOMPdfStyles.cell}>As per attached annexure</Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}>For info</Text>

              </View>
               <View style={MOMPdfStyles.row}>
               <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}> Die Size</Text>.
                <Text style={MOMPdfStyles.cell}>As per attached annexure</Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}>For info</Text>

              </View>
               <View style={MOMPdfStyles.row}>
               <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}> Die Size</Text>.
                <Text style={MOMPdfStyles.cell}>As per attached annexure</Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}></Text>
                <Text style={MOMPdfStyles.cell}>For info</Text>

              </View>


              {/* Entries table */}
              {groupedEntries[workOrderNo].map((entry, index) => (


                <View style={MOMPdfStyles.row} key={entry.momEntryId || `${workOrderNo}-${index}`}>
                  <Text style={MOMPdfStyles.cell}>{index + 1}</Text>
                  <Text style={MOMPdfStyles.cell}>{entry.observation || ""}</Text>
                  <Text style={MOMPdfStyles.cell}>{entry.details || ""}</Text>

                  {/* Illustration Images */}
                  <View style={MOMPdfStyles.cell}>
                    {(entry.illustrationImages || []).map((img, i) => (
                      <Image key={i} src={img.image} style={MOMPdfStyles.image} />
                    ))}
                  </View>

                  {/* Corrected Images */}
                  <View style={MOMPdfStyles.cell}>
                    {(entry.correctedImages || []).map((img, i) => (
                      <Image key={i} src={img.image} style={MOMPdfStyles.image} />
                    ))}
                  </View>

                  <Text style={MOMPdfStyles.cell}>{entry.correctedPoints || ""}</Text>
                  <Text style={MOMPdfStyles.cell}>{entry.responsibleAndTarget || ""}</Text>
                </View>
              ))}
            </View>
        
          );
        })}
        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.RemarkCell}>
            Remarks :  {momInfo.remark}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default function MOMPDFModel({ show, onClose, momId }) {
  const [momData, setMomData] = useState({});
  const [momEntries, setMOMEntries] = useState([]);
  const [workOrder, setWorkOrder] = useState({})
  const [workOrderItemProcess, setWorkOrderItemProccess] = useState([])
  useEffect(() => {
    fetchMomData();
  }, [momId]); // run when momId changes


  const fetchMomData = async () => {
    try {
      const response = await axiosInstance.get(`/kickoff/getSingleMomById/${momId}`);
      setMomData(response.data);
      setMOMEntries(response.data.momEntries);

      const workOrderResponse = await axiosInstance.get(`/work/geSingletWorkOrderItemNo/${response.data.momInfo.itemNo}`)
      setWorkOrder(workOrderResponse.data)

      const workOrderItemProcessResponse = await axiosInstance.get(`/work/getWorkOrderById/${workOrderResponse.data.workOrderId}`)
      setWorkOrderItemProccess(workOrderItemProcessResponse.data.workOrderItems);


    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Body style={{ height: "80vh" }}>
        <PDFViewer width="100%" height="100%">
          <MyDocument
            momData={momData}
            momEntries={momEntries}
            workOrder={workOrder}
            workOrderItemProcess={workOrderItemProcess}
          />
        </PDFViewer>
      </Modal.Body>
    </Modal>
  );
}
