
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
import axiosInstance from "../BaseComponet/axiosInstance";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaginationComponent from "../Pagination/PaginationComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Col,Row } from "react-bootstrap";


const LeadCompany = () => {
      const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [editMode, setEditMode] = useState(false); // If you're editing existing record

  // Modal & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    leadCreatedDate: "",
    leadUpdateDate: "",
    customerName: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
  });

  useEffect(() => {
    fetchLeads(page, size);
  }, [page, size]);

  const fetchLeads = async (page, size) => {
    try {
      // dynamic URL
      const response = await axiosInstance.get(
        `/company/getLeads/${page}/${size}`
      );
      setLeads(response.data.Leads);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch Leads:", error);
    }
  };

  // Toggle modal visibility
  const toggleModal = () => setShowCreateModal((v) => !v);

  // Handle form input changes
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Submit the create-lead form
  const createLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        leadCreatedDate: new Date(form.leadCreatedDate).toISOString(),
        leadUpdateDate: new Date(form.leadUpdateDate).toISOString(),
      };
      const res = await axiosInstance.post("/company/createLead", payload);
      toast.success("Lead created! ID: " + res.data.leadId);

      // Refresh table
      toggleModal();
      setPage(0);
      fetchLeads(0, size);

      // Reset form
      setForm({
        leadCreatedDate: "",
        leadUpdateDate: "",
        customerName: "",
        mobileNumber: "",
        phoneNumber: "",
        email: "",
        companyName: "",
        address: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
      });
    } catch (err) {
      console.error("Create lead failed:", err);
      toast.error("Failed to create lead.");
    } finally {
      setIsSubmitting(false);
    }
  };


    const handleUpdate = (lead) => {
      navigate(`/updateLead/${lead.leadId}`, {
        state: { lead },
      });
    };

  return (
    <>
      <CompanyTopbar />
      <div className="slidebar-main-div">
        <CompanySidebar />

        <div className="slidebar-main-div-right-section">


          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
              <div className="col-md-3">
                <h4>Employee List</h4>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    // value={searchTerm}
                    // onChange={(e) => {
                    //   const term = e.target.value;
                    //   setSearchTerm(term);
                    //   searchEmployees(term);
                    // }}
                  />
                </div>
              </div>
              <div className="col-md-3 d-flex justify-content-end">
                <button className="btn btn-dark" onClick={toggleModal}>
                  + Create Lead
                </button>

                {/* Create Lead Modal */}
                <Modal
                  show={showCreateModal}
                  onHide={toggleModal}
                  size="lg" // makes the modal wider
                  aria-labelledby="create-lead"
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="create-lead">Create New Lead</Modal.Title>
                  </Modal.Header>

                  <Form onSubmit={createLead}>
                    <Modal.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="customerName">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control
                              name="customerName"
                              value={form.customerName}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="companyName">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                              name="companyName"
                              value={form.companyName}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="mobileNumber">
                            <Form.Label>Mobile Number</Form.Label>
                            <Form.Control
                              name="mobileNumber"
                              type="tel"
                              value={form.mobileNumber}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="phoneNumber">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              name="phoneNumber"
                              type="tel"
                              value={form.phoneNumber}
                              onChange={onChange}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              name="email"
                              type="email"
                              value={form.email}
                              onChange={onChange}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="address">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="address"
                              value={form.address}
                              onChange={onChange}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="country">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                              name="country"
                              value={form.country}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="state">
                            <Form.Label>State</Form.Label>
                            <Form.Control
                              name="state"
                              value={form.state}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              name="city"
                              value={form.city}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="zipCode">
                            <Form.Label>Zip Code</Form.Label>
                            <Form.Control
                              name="zipCode"
                              value={form.zipCode}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group
                            className="mb-3"
                            controlId="leadCreatedDate"
                          >
                            <Form.Label>Created Date &amp; Time</Form.Label>
                            <Form.Control
                              name="leadCreatedDate"
                              type="datetime-local"
                              value={form.leadCreatedDate}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group
                            className="mb-3"
                            controlId="leadUpdateDate"
                          >
                            <Form.Label>Updated Date &amp; Time</Form.Label>
                            <Form.Control
                              name="leadUpdateDate"
                              type="datetime-local"
                              value={form.leadUpdateDate}
                              onChange={onChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Modal.Body>

                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={toggleModal}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving…" : "Save Lead"}
                      </Button>
                    </Modal.Footer>
                  </Form>
                </Modal>
              </div>
            </div>
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Created</th>
                  <th>MobileNO</th>
                  <th>Email</th>
                  <th>Company Name</th>
                  <th>Edit</th>
                </tr>
              </thead>

              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, idx) => (
                    <tr key={lead.leadId}>
                      <td>{idx + 1}</td>
                      <td>{lead.customerName}</td>
                      <td>
                        {new Date(lead.leadCreatedDate).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td>{lead.mobileNumber}</td>
                      <td>{lead.email}</td>
                      <td>{lead.companyName}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                                onClick={() => handleUpdate(lead)}
                          
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <PaginationComponent
              currentPage={page}
              pageSize={size}
              pageCount={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0); // Reset to first page when size changes
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadCompany;
