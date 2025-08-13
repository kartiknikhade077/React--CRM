import { StyleSheet } from "@react-pdf/renderer";
export const MOMPdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    margin: 0,
    padding: 0,

    // paddingVertical: 8,
  },
  titleCell: {
    flex: 1,
    fontSize: 20,
    borderBottom: "1px solid #ccc",
    borderTop: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    borderRight: "1px solid #ccc",
    textAlign: "center",
  },
  infoCell: {
    flex: 1,
    fontSize: 15,
    borderBottom: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    borderRight: "1px solid #ccc",
    textAlign: "center",
  },

  customerSerialNo: {
    flex: 1,
    fontSize: 15,
    borderBottom: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
   
    textAlign: "center",
    minWidth: 20,

  }
  ,
  thirdPartyBlankCell: {
    width: 120, // fixed width in points
    fontSize: 15,
    borderBottom: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    textAlign: "center",
  },

  OtherthirdPartyBlankCell: {
    width: 300, // wider column
    fontSize: 15,
    borderBottom: "1px solid #ccc",
    textAlign: "center",
  },

  thidPartySerialNo: {
    width: 200,
    fontSize: 12,
    borderBottom: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    textAlign: "center",
  },

  thidPartyCustomerName: {
    width: 200,
    fontSize: 12,
    borderBottom: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    borderRight: "1px solid #ccc",
    textAlign: "center",
  },
    column: {
    flex: 1,
    borderLeft: "1px solid #ccc",
    borderBottom: "1px solid #ccc",
  },
   thirdPartycolumn: {
    flex: 1,
    
    borderLeft: "1px solid #ccc",
   
  },
    lastNamecolumn: {
       fontSize: 12,
    flex: 1,
    borderRight: "1px solid #ccc",
     borderLeft: "1px solid #ccc",
    borderBottom: "1px solid #ccc",
      textAlign: "center",
  },
   cellText: {
    fontSize: 12,
     textAlign: "center",
     borderBottom: "1px solid #ccc",

  },

    intoducntionCell: {
    flex: 1,
    fontSize:15,
    borderBottom: "1px solid #ccc",
    borderTop: "1px solid #ccc",
    borderLeft: "1px solid #ccc",
    borderRight: "1px solid #ccc",
    textAlign: "left",
    minHeight:50
  },

  introductionText : {
fontSize:12,
  },

 momEntriesHeader: {
  flex :1,
  width: 80, // adjust per column
  fontSize: 12,
  borderBottom: "1px solid #ccc",
  borderLeft: "1px solid #ccc",
  borderRight: "1px solid #ccc",
  textAlign: "center",
},
cell: {
  flex:1,
  width: 80,
  fontSize: 12,
  borderBottom: "1px solid #ccc",
  borderLeft: "1px solid #ccc",
  borderRight: "1px solid #ccc",
  textAlign: "center",
  padding: 2
},
image: {
  width: 60,
  height: 60,
  marginVertical: 2
}
,
workOrderHeader:{
  flex:1,
 borderLeft: "1px solid #ccc",
  borderRight: "1px solid #ccc",
   borderBottom: "1px solid #ccc",
 padding:0
}


});

