// KickOffPDF.jsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Example font registration if needed
// Font.register({ family: 'Roboto', src: 'url-to-font.ttf' });

const styles = StyleSheet.create({
  // Define all your layout styles here
  page: { padding: 24, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header1: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  logo: { width: 50, height: 50 },
  //   title: {
  //     textAlign: "center",
  //     fontSize: 20,
  //     fontWeight: "bold",
  //     marginBottom: 8,
  //   },
  section: { marginBottom: 8 },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee",
  },
  table1: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee",
  },

  tableRow: { flexDirection: "row" },
  tableRow1: { flexDirection: "row" },
  tableCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: "#eee",
  },

  tableCellBlank: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#eee",
    // borderBottomWidth: 1,
  },
  tableCell1: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderTop: 1,
    borderStyle: "solid",
    borderColor: "#eee",
  },

  highlighted: { backgroundColor: "#FFFFAA" },
  signatureCell: {
    minHeight: 30,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  // ... more styles as per your layout ...

  MainRow1: {
    flexDirection: "row",
  },

  Rowcol1: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
  },

  prjTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    padding: 4,
  },
});

function getReqValue(requirements, type, i = "One") {
  const req = requirements.find((r) => r.requirementType === type);
  return req ? req[`requirement${i}`] : "N/A";
}

const KickOffPDF = ({ data }) => {
  const {
    kickOffInfo,
    itemProcessList,
    kickOffItemsList,
    requirementList,
    listofSingnature,
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* <View>

          </View> */}
          <Text style={styles.header1}>PROJECT KICK OFF SHEET</Text>
          {/* <Text>
            Work Orders:{" "}
            {itemProcessList.map((i) => i.workOrderNumber).join(", ")}
          </Text> */}
        </View>

        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            <View style={styles.Rowcol1}>
              {" "}
              <Text>Customer:</Text>
            </View>
            <View style={styles.Rowcol1}>
              <Text>{kickOffInfo.customerName}</Text>{" "}
            </View>
            <View style={styles.Rowcol1}>
              <Text> Customer Billing</Text>
            </View>
          </View>
        </View>
        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            <View style={styles.Rowcol1}>
              {" "}
              <Text> Project:</Text>
            </View>
            <View style={styles.Rowcol1}>
              <Text> {kickOffInfo.projectName}</Text>{" "}
            </View>
            <View style={styles.Rowcol1}>
              <Text>{kickOffInfo.billingAddress} </Text>
            </View>
          </View>
        </View>
        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            <View style={styles.Rowcol1}>
              {" "}
              <Text> Contact Person: </Text>
            </View>
            <View style={styles.Rowcol1}>
              <Text>{kickOffInfo.contactPersonName}</Text>{" "}
            </View>
            <View style={styles.Rowcol1}>
              <Text>Shipping Address: </Text>
            </View>
          </View>
        </View>
        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            <View style={styles.Rowcol1}>
              {" "}
              <Text> Kick off Date:</Text>
            </View>
            <View style={styles.Rowcol1}>
              <Text>{kickOffInfo.kickOffDate} </Text>{" "}
            </View>
            <View style={styles.Rowcol1}>
              <Text> {kickOffInfo.shippingAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            <View style={styles.Rowcol1}>
              {" "}
              <Text> Delivery:</Text>
            </View>
            <View style={styles.Rowcol1}>
              <Text>
                {kickOffInfo.startDate} to {kickOffInfo.endDate}
              </Text>{" "}
            </View>
            <View style={styles.Rowcol1}>
              <Text> </Text>
            </View>
          </View>
        </View>

        <View style={styles.section1}>
          <View style={styles.MainRow1}>
            {" "}
            <Text style={styles.prjTitle}>
              Project Title :{kickOffInfo.projectTitle}
            </Text>
          </View>
        </View>

        {/* Project Table */}
        <View style={styles.section}>
          <View style={[styles.table, { fontSize: 9 }]}>
            {/* TABLE HEADER */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>
                Part Name/Material/Thk
              </Text>
              <Text style={styles.tableCell}>Design</Text>
              <Text style={styles.tableCell}>WO NO</Text>
              <Text style={styles.tableCell}>OP NO</Text>
              <Text style={styles.tableCell}>Process</Text>
              <Text style={styles.tableCell}>L</Text>
              <Text style={styles.tableCell}>W</Text>
              <Text style={styles.tableCell}>H</Text>
              <Text style={styles.tableCell}>Remarks</Text>
            </View>

            {kickOffItemsList.map((item) => {
              const processes = itemProcessList.filter(
                (proc) => proc.itemNo === item.itemNo
              );
              console.log("processes.length", processes);
              // If the item has processes:
              if (processes.length > 0) {
                return processes.map((proc, idx) => (
                  <View style={styles.tableRow} key={`${item.itemId}-${idx}`}>
                    {/* Merge first two columns (only in the first row) */}
                    {idx === 0 ? (
                      <>
                        <Text style={[styles.tableCell1, { flex: 1.5 }]}>
                          {item.partName} / {item.material} / {item.thickness}
                        </Text>
                        <View style={styles.tableCell1}>
                          {item.imageList &&
                            item.imageList.length > 0 &&
                            item.imageList.map((imgBase64, imgIdx) => (
                              <Image
                                key={imgIdx}
                                src={`data:image/png;base64,${imgBase64}`}
                                style={{
                                  width: 32,
                                  height: 32,
                                  marginBottom: 2,
                                }}
                              />
                            ))}
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Blank cells for alignment (merged visually) */}
                        <Text
                          style={[styles.tableCellBlank, { flex: 1.5 }]}
                        ></Text>
                        <View style={[styles.tableCellBlank]}></View>
                      </>
                    )}
                    {/* Process columns */}
                    <Text style={styles.tableCell}>{proc.workOrderNumber}</Text>
                    <Text style={styles.tableCell}>
                      {proc.operationNumber || ""}
                    </Text>
                    <Text style={styles.tableCell}>{proc.process}</Text>
                    <Text style={styles.tableCell}>{proc.length}</Text>
                    <Text style={styles.tableCell}>{proc.width}</Text>
                    <Text style={styles.tableCell}>{proc.height}</Text>
                    <Text style={styles.tableCell}>{proc.remarks}</Text>
                  </View>
                ));
              } else {
                // If no processes, show full row with merged columns
                return (
                  <View style={styles.tableRow} key={item.itemId}>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                      {item.partName} / {item.material} / {item.thickness}
                    </Text>
                    <View style={styles.tableCell}>
                      {item.imageList &&
                        item.imageList.length > 0 &&
                        item.imageList.map((imgBase64, imgIdx) => (
                          <Image
                            key={imgIdx}
                            src={`data:image/png;base64,${imgBase64}`}
                            style={{ width: 32, height: 32, marginBottom: 2 }}
                          />
                        ))}
                    </View>
                    {/* Empty process columns if no process */}
                    {Array(7)
                      .fill("")
                      .map((_, i) => (
                        <Text style={styles.tableCell} key={i}></Text>
                      ))}
                  </View>
                );
              }
            })}
          </View>
        </View>

        {/* Customer Requirements Table */}
        <View style={styles.section}>
          <Text>Customer Requirements</Text>
          <View style={styles.table1}>
            {[
              "Inserts (Main/CAM)",
              "Standard Material",
              "Heat Treatment HT",
              "HT Certificate",
              "Tool Construction",
              "Coating Considered",
              "Tryout RM",
              "Spare Quantity",
              "Spare Items",
              "Tool Life Considered",
              "Checking Fixture",
              "Transport",
              "Remarks",
            ].map((type) => (
              <View style={styles.tableRow1} key={type}>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{type}</Text>
                <Text style={styles.tableCell}>
                  {getReqValue(requirementList, type, "One")}
                </Text>
                <Text style={styles.tableCell}>
                  {getReqValue(requirementList, type, "Two")}
                </Text>
                <Text style={styles.tableCell}>
                  {getReqValue(requirementList, type, "Three")}
                </Text>
                <Text style={styles.tableCell}>
                  {getReqValue(requirementList, type, "Four")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Signature Table */}
        <View style={styles.section}>
          <Text>Signature</Text>
          <View
            style={[
              styles.table,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            {listofSingnature.map((sig) => (
              <View style={styles.signatureCell} key={sig.id}>
                <Text>{sig.departments}</Text>
                <Text>Sign</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Footer */}
        <View
          style={[styles.section, { marginTop: 30, alignItems: "flex-end" }]}
        >
          <Text>Mr. Shriram Handibag</Text>
          <Text>PLANNETTO TOOLTECH PVT LTD</Text>
        </View>
      </Page>
    </Document>
  );
};

export default KickOffPDF;
