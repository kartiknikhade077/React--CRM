import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Document, Page, Text, View, PDFViewer, Image } from "@react-pdf/renderer";
import { MOMPdfStyles } from "./MOMPdfStyles";
import axiosInstance from "../../BaseComponet/axiosInstance";

// PDF Content
const MyDocument = ({ momData, momEntries }) => {

  const momInfo = momData.momInfo
  const momEntriesData = momEntries

  // Group by workOrderNo
  const groupedEntries = momEntriesData.reduce((acc, entry) => {
    if (!entry.workOrderNo) return acc;
    if (!acc[entry.workOrderNo]) acc[entry.workOrderNo] = [];
    acc[entry.workOrderNo].push(entry);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={MOMPdfStyles.page}>
        {/* Row 1 */}
        <View style={MOMPdfStyles.row}>
          {/* <Text style={MOMPdfStyles.titleCell}> MOM- {momInfo.customerName}</Text> */}

        </View>
        <View style={MOMPdfStyles.row}>
          <Text style={MOMPdfStyles.infoCell}> Project :{momInfo.projectName}</Text>
          <Text style={MOMPdfStyles.infoCell}> Venue : {momInfo.venue}</Text>
          <Text style={MOMPdfStyles.infoCell}> Date : {momInfo.createdDate} </Text>

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



        {Object.keys(groupedEntries).map((workOrderNo) => (
          <View key={workOrderNo} style={{ marginTop: 10 }}>
            <View style={MOMPdfStyles.row}>
              <Text style={MOMPdfStyles.workOrderHeader}>
                Work Order No: {workOrderNo}
              </Text>
            </View>

            {groupedEntries[workOrderNo].map((entry, index) => (
              <View style={MOMPdfStyles.row} key={entry.momEntryId || `${workOrderNo}-${index}`}>
                <Text style={MOMPdfStyles.cell}>{index + 1}</Text>
                <Text style={MOMPdfStyles.cell}>{entry.observation || ""}</Text>
                <Text style={MOMPdfStyles.cell}>{entry.details || ""}</Text>

                {/* Illustration Images */}
                <View style={MOMPdfStyles.cell}>
                  {(entry.illustrationImages || []).map((img, i) => (
                    <Image
                      key={i}
                      src={img.image}
                      style={MOMPdfStyles.image}
                    />
                  ))}
                </View>


                {/* Corrected Images */}
                <View style={MOMPdfStyles.cell}>
                  {(entry.correctedImages || []).map((img, i) => (
                    <Image
                      key={i}
                      src={img.image}
                      style={MOMPdfStyles.image}
                    />
                  ))}
                </View>

                <Text style={MOMPdfStyles.cell}>{entry.correctedPoints || ""}</Text>
                <Text style={MOMPdfStyles.cell}>{entry.responsibleAndTarget || ""}</Text>
              </View>
            ))}
          </View>
        ))}









      </Page>
    </Document>
  );
};

export default function MOMPDFModel({ show, onClose, momId }) {
  const [momData, setMomData] = useState({});
  const [momEntries, setMOMEntries] = useState([]);
  useEffect(() => {
    fetchMomData();
  }, [momId]); // run when momId changes


  const fetchMomData = async () => {
    try {
      const response = await axiosInstance.get(`/kickoff/getSingleMomById/${momId}`);
      setMomData(response.data);
      setMOMEntries(response.data.momEntries);
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
          />
        </PDFViewer>
      </Modal.Body>
    </Modal>
  );
}
