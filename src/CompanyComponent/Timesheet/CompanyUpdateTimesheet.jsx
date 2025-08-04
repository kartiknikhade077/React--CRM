import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Dropdown } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CompanyUpdateTimesheet = ({
  show,
  handleClose,
  timeSheetId,
  onSuccess,
}) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [searchTermDesigner, setSearchTermDesigner] = useState("");
  const [timeError, setTimeError] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    itemNumber: "",
    workOrder: "",
    designer: "",
    designerId: "",
    fromTime: "",
    toTime: "",
    remarks: "",
  });

  const resetForm = () => {
    setFormData({
      date: "",
      itemNumber: "",
      workOrder: "",
      designer: "",
      designerId: "",
      fromTime: "",
      toTime: "",
      remarks: "",
    });
  };

  useEffect(() => {
    if (show && timeSheetId) {
      console.log("Fetching Timesheet for ID:", timeSheetId); // Debug log

      axiosInstance
        .get(`/timesheet/getTimeSheetbyId/${timeSheetId}`)
        .then((res) => {

              console.log("API Response:", res.data);
          const data = res.data;
          setFormData({
            date: data.createDate || "",
            itemNumber: data.itemNumber || "",
            workOrder: data.workOrderNo || "",
            designer: data.designerName || "",
            designerId: data.employeeId || "",
            fromTime: data.startTime?.slice(0, 5) || "",
            toTime: data.endTime?.slice(0, 5) || "",
            remarks: data.remarks || "",
          });
               console.log("FormData after setting:", {
                 date: data.createDate || "",
                 itemNumber: data.itemNumber || "",
                 workOrder: data.workOrderNo || "",
                 designer: data.designerName || "",
                 designerId: data.employeeId || "",
                 fromTime: data.startTime?.slice(0, 5) || "",
                 toTime: data.endTime?.slice(0, 5) || "",
                 remarks: data.remarks || "",
               });
        })
        .catch(() => toast.error("Failed to fetch timesheet."));
    }
  }, [show, timeSheetId]);

  useEffect(() => {
    if (show) {
      axiosInstance
        .get("/company/getEmployeeList/0/1000")
        .then((res) => setEmployeeList(res.data.employeeList || []))
        .catch(() => setEmployeeList([]));
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotalTime = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":"),
      [eh, em] = end.split(":"),
      startMin = +sh * 60 + +sm,
      endMin = +eh * 60 + +em;
    return ((endMin - startMin) / 60).toFixed(2);
  };

  const handleSubmit = async () => {
    const { date, workOrder, designer, designerId, itemNumber, fromTime, toTime, remarks } =
      formData;
    if (
      !date ||
      !workOrder ||
      !designer ||
      !designerId ||
      !fromTime ||
      !toTime
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const from = new Date(`1970-01-01T${fromTime}`);
    const to = new Date(`1970-01-01T${toTime}`);
    if (to <= from) {
      setTimeError("To Time must be greater than From Time.");
      return;
    } else {
      setTimeError("");
    }

    const payload = {
      timeSheetId: timeSheetId,
      employeeId: designerId,
      itemNumber: itemNumber,
      workOrderNo: workOrder,
      designerName: designer,
      startTime: `${fromTime}:00`,
      endTime: `${toTime}:00`,
      totalTime: calculateTotalTime(fromTime, toTime),
      remarks: remarks,
      createDate: date,
    };

    try {
      await axiosInstance.put("/timesheet/updateTimeSheet", payload);
      toast.success("Timesheet updated successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      toast.error("Error updating timesheet.");
    }
  };

  const filteredDesigners = employeeList.filter((emp) =>
    emp.name.toLowerCase().includes(searchTermDesigner.toLowerCase())
  );
  const selectedDesigner = employeeList.find(
    (emp) => emp.name === formData.designer
  );

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-bottom-0">
          <Modal.Title className="fw-semibold fs-4 text-primary">
            ✏️ Update Timesheet
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pt-3 pb-0">
          <Form>
            <Row className="gy-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> Work Order
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="workOrder"
                    value={formData.workOrder}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> Item Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="itemNumber"
                    value={formData.itemNumber}
                    placeholder="Enter Item Number"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="gy-3 mt-2">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> From
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> To
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleChange}
                  />
                  {timeError && (
                    <div className="text-danger small mt-1">{timeError}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> Designer
                  </Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-dark"
                      style={{ width: "100%", textAlign: "left" }}
                    >
                      {selectedDesigner
                        ? selectedDesigner.name
                        : "Select Designer"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      <div className="px-3 py-2">
                        <Form.Control
                          type="text"
                          placeholder="Search designer..."
                          value={searchTermDesigner}
                          onChange={(e) =>
                            setSearchTermDesigner(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredDesigners.length > 0 ? (
                        filteredDesigners.map((emp, idx) => (
                          <Dropdown.Item
                            key={emp.employeeId || `emp-${idx}`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                designer: emp.name,
                                designerId: emp.employeeId,
                              }));
                              setSearchTermDesigner("");
                              document.body.click();
                            }}
                          >
                            {emp.name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No results</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
            </Row>

            <Row className="gy-3 mt-2 mb-2">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    <span className="text-danger">*</span> Remarks
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="remarks"
                    rows={3}
                    placeholder="Enter remarks here..."
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.fromTime && formData.toTime && (
              <Row className="mt-3">
                <Col className="text-end text-muted">
                  ⏱ Total Hours:{" "}
                  <strong>
                    {calculateTotalTime(formData.fromTime, formData.toTime)} hrs
                  </strong>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="bg-light border-top-0 px-4 pb-4 pt-3">
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CompanyUpdateTimesheet;
