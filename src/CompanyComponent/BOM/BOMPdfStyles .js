import { StyleSheet } from "@react-pdf/renderer";

export const BOMPdfStyles = StyleSheet.create({
    page: {
        padding: 30
    },
    row: {
        flexDirection: "row"
    },
    // Normal table cell (full border)
    col: {
        flex: 1,
        padding: 5,
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        borderLeft: "1pt solid #000",
        textAlign: "center"
    },
    // Last column with right border
    colLast: {
        flex: 1,
        padding: 0,
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        borderLeft: "1pt solid #000",
        borderRight: "1pt solid #000",
        textAlign: "center"
    },
    // For next row where top border is hidden (joins previous row)
    colNoTop: {
        flex: 1,

        borderBottom: "1pt solid #000",
        borderLeft: "1pt solid #000",
        textAlign: "center"
    },
    colNoTopLast: {
        flex: 1,
        padding: 5,
        borderBottom: "1pt solid #000",
        borderLeft: "1pt solid #000",
        borderRight: "1pt solid #000",
        textAlign: "center"
    },
    smallText: {
        fontSize: 12, // smaller than your default 12
        textAlign: "left"
    },
    categoryTextHeading: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",  // center the category header
        marginBottom: 0,      // remove bottom gap
        marginTop: 0,
        borderLeft: "1pt solid #000",
        borderRight: "1pt solid #000",         // remove top gap
    },

    tableRow: {
        flexDirection: "row",
        padding: 0,
        margin: 0
    },

    tableHeader: {
        flex: 1,
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
        borderTop: "1pt solid #000",
        borderBottom: "1pt solid #000",
        padding: 2,
        borderRight: "1pt solid #000" // right border for all except last cell
    },

    tableHeaderFirst: {
        borderLeft: "1pt solid #000"
    },

    tableHeaderLast: {
        borderRight: "1pt solid #000" // ensure last header has right edge
    },

    tableCell: {
        flex: 1,
        fontSize: 10,
        padding: 2,
        textAlign: "center",
        borderBottom: "1pt solid #000",
        borderRight: "1pt solid #000" // right border for all except last cell
    },

    tableCellFirst: {
        borderLeft: "1pt solid #000"
    },

    tableCellLast: {
        borderRight: "1pt solid #000"
    }



});
