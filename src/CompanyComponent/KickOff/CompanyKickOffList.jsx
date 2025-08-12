import React, { useEffect, useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import PaginationComponent from "../../Pagination/PaginationComponent";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../BaseComponet/axiosInstance";

// import { Modal, Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import KickOffPDF from "./KickOffPDF";

const KickOffList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kickOffList, setKickOffList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  const navigate = useNavigate();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreateClick = () => {
    navigate("/KickOffCreate");
  };

  // Fetch Data
  useEffect(() => {
    axiosInstance
      .get(`/kickoff/getAllKickOffs/${currentPage}/${pageSize}`)
      .then((res) => {
        setKickOffList(res.data.kickOffList);
        setPageCount(res.data.totalPages);
      })
      .catch((err) => {
        setKickOffList([]);
        setPageCount(0);
      });
  }, [currentPage, pageSize]);




  const handlePdfClick = async (kickOffId) => {
    // Fetch PDF data from API
    try {
      const { data } = await axiosInstance.get(
        `/kickoff/getKickOffInfo/${kickOffId}`
      );
    console.log("Kickoffinfo-->",data);
      setPdfData(data);
      setShowPdfModal(true); // Show modal when data is set
    } catch (error) {
      setPdfData(null);
    }
  };

  return (
    <>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
              <div className="col-md-3">
                <h4>Kickoff List</h4>
              </div>
              <div className="col-md-6 d-flex justify-content-end">
                <Button className="btn btn-dark" onClick={handleCreateClick}>
                  Create
                </Button>
                <Button variant="outline-primary" className="me-2 ms-2">
                  Filter
                </Button>
              </div>
            </div>

            <div className="table-main-div">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>NO</th>
                    <th>Customer No</th>
                    <th>Project</th>
                    <th>Customer Name</th>
                    <th>KickoffDate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {kickOffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No Data Available
                      </td>
                    </tr>
                  ) : (
                    kickOffList.map((item, idx) => (
                      <tr key={item.kickOffId}>
                        <td>{idx + 1 + currentPage * pageSize}</td>
                        <td>{item.customerName || "--"}</td>
                        <td>{item.projectName || "--"}</td>
                        <td>{item.customerName || "--"}</td>
                        <td>{item.kickOffDate || "--"}</td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              navigate(`/KickOffUpdate/${item.kickOffId}`)
                            }
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm ms-2"
                            onClick={() => handlePdfClick(item.kickOffId)}
                          >
                            <i className="bi bi-file-pdf"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setCurrentPage(0);
                setPageSize(size);
              }}
            />
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <Modal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        size="xl"
        dialogClassName="modal-90w"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Kick Off Sheet PDF Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: "80vh" }}>
          {pdfData && (
            <PDFViewer width="100%" height="700">
              <KickOffPDF data={pdfData} />
            </PDFViewer>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
            Close
          </Button>
          {/* For exporting/printing, use react-pdf's PDFDownloadLink */}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KickOffList;
