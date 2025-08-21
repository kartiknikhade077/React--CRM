import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Dropdown } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


const CompanyCreateTimesheet = ({
  show,
  handleClose,
  employeeId,
  onSuccess,
}) => {


  const [employeeList, setEmployeeList] = useState([]);
  const [searchTermDesigner, setSearchTermDesigner] = useState("");
  const [timeError, setTimeError] = useState("");
  const [itemList, setItemList] = useState([])
  const [selectedItem, setSelectedItem] = useState(0)
  const [workOrderNumberList, setWorkOrderNumberList] = useState([])
  const [selectedWorkorder, setSelectedWorkOrde] = useState("")

  const fetchItems = async () => {
    setSelectedWorkOrde("");
    const response = await axiosInstance.get("/work/getItemList");

    const options = response.data.map(item => ({
      value: item,
      label: item
    }));

    options.push({
      value: 0,
      label: "Other"
    });

    setItemList(options);
  };

  const fetchWorkOrders = async () => {
    let options = [{ value: "Other", label: "Other" }];

    if (selectedItem.value === 0) {
      options = [
        { value: "WRM MEETING", label: "WRM MEETING" },
        { value: "VENDER VISIT", label: "VENDER VISIT" },
        { value: "TRAINING", label: "TRAINING" },
        { value: "RFQ PREPRATION", label: "RFQ PREPRATION" },
        { value: "PROJECT", label: "PROJECT" },
        { value: "ONLINE MEETING", label: "ONLINE MEETING" },
        { value: "MORNING  MEETING", label: "MORNING  MEETING" },
        { value: "MIS  MEETING", label: "MIS  MEETING" },
        { value: "IT WORK", label: "IT WORK" },
        { value: "INTERNAL DAP", label: "INTERNAL DAP" },
        { value: "FEASIBILITY", label: "FEASIBILITY" },
        { value: "CUSTOMER VISIT", label: "CUSTOMER VISIT" },
        { value: "CUSTOMER DAP", label: "CUSTOMER DAP" },
        { value: "CELEBRATION", label: "CELEBRATION" },
        { value: "OTHER", label: "OTHER" }
      ];
    } else {
      const response = await axiosInstance.get(
        `/work/getWorkOrderByItemNo/${selectedItem.value}`
      );
      options = response.data.map(item => ({
        value: item,
        label: item
      }));
    }

    setWorkOrderNumberList(options);
  };



  const handleDesignerChange = (e) => {
    const selectedDesignerId = e.target.value;
    const selectedDesigner = employeeList.find(
      (designer) => designer.id === selectedDesignerId
    );

    if (selectedDesigner) {
      setFormData((prevData) => ({
        ...prevData,
        designer: selectedDesigner.name, // or selectedDesigner.fullName if you have that
        employeeId: selectedDesigner.id,
      }));
    }
  };

  const [formData, setFormData] = useState({
    date: "",
    workOrder: "",
    designer: "",
    designerId: "",
    fromTime: "",
    toTime: "",
    remarks: "",
    itemNumber:0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotalTime = (start, end) => {
    if (!start || !end) {
      console.error("Start time or end time is undefined", { start, end });
      return 0;
    }

    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    let diff = (endDate - startDate) / 1000 / 60 / 60; // convert milliseconds to hours

    if (diff < 0) {
      diff += 24; // handle crossing midnight
    }

    return parseFloat(diff.toFixed(2)); // return hours with 2 decimal points
  };

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

  const handleSubmit = async () => {
    const {
      date,
      itemNumber,
      workOrder,
      designer,
      designerId: employeeId,
      fromTime,
      toTime,
      remarks,
    } = formData;

    if (!date || !workOrder || !designer || !employeeId || !fromTime || !toTime) {
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

    // Append seconds if missing
    const formattedFromTime = fromTime.length === 5 ? `${fromTime}:00` : fromTime;
    const formattedToTime = toTime.length === 5 ? `${toTime}:00` : toTime;

    const payload = {
      employeeId: employeeId,
      itemNumber: itemNumber,
      workOrderNo: workOrder,
      designerName: designer,
      startTime: formattedFromTime,
      endTime: formattedToTime,
      totalTime: calculateTotalTime(fromTime, toTime),
      remarks: remarks,
      createDate: date,
    };

    try {
      const response = await axiosInstance.post(
        "/timesheet/createTimeSheet",
        payload
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Timesheet Created Successfully");
        if (onSuccess) onSuccess();
        resetForm();
        setTimeError("");
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create timesheet:", error);
      toast.error("Error creating timesheet");
    }
  };


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          "/company/getEmployeeList/0/1000"
        );
        setEmployeeList(response.data.employeeList || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setEmployeeList([]);
      }
    };

    fetchEmployees();
    
  }, []);

  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);
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
            🕒 Create Timesheet
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pt-3 pb-0">
          <Form>
            {/* Row 1 - Date / Work Order / Designer */}
            <Row className="gy-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
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
                  <Form.Label className="fw-semibold">
                    <span className="text-danger">*</span> Item Number
                  </Form.Label>
                  <Select
                    options={itemList}
                    value={selectedItem}
                     onChange={(selectedOption) => {
                      setSelectedItem(selectedOption);
                      setFormData({
                        ...formData,
                        itemNumber: selectedOption?.value || 0
                      });
                    }}
                    placeholder="Select a item..."
                    isClearable
                    onMenuOpen={fetchItems}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>
                    Work Order No.
                  </Form.Label>
                  <Select
                    options={workOrderNumberList}
                    value={selectedWorkorder}
                    onChange={(selectedOption) => {
                      setSelectedWorkOrde(selectedOption);
                      setFormData({
                        ...formData,
                        workOrder: selectedOption?.value || ""
                      });
                    }}

                    placeholder="Select a WorkOrder..."
                    isClearable
                    onMenuOpen={fetchWorkOrders}
                    isDisabled={!selectedItem}
                  />
                </Form.Group>
              </Col>


            </Row>

            {/* Row 2 - Time & Remarks */}
            {/* Row 2 - Time & Remarks */}
            <Row className="gy-3 mt-2">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
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
                <Form.Group controlId="formToTime">
                  <Form.Label>
                    {" "}
                    <span className="text-danger">*</span>To Time
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.toTime}
                    onChange={(e) =>
                      setFormData({ ...formData, toTime: e.target.value })
                    }
                    required
                  />
                  {timeError && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "0.9rem",
                        marginTop: "4px",
                      }}
                    >
                      {timeError}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    {" "}
                    <span className="text-danger">*</span>Designer
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
                        filteredDesigners.map((emp, index) => (
                          <Dropdown.Item
                            key={emp.employeeId || `designer-${index}`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                designer: emp.name,
                                designerId: emp.employeeId,
                              }));
                              setSearchTermDesigner("");
                              document.body.click(); // Close dropdown
                            }}
                            active={formData.designer === emp.name}
                          >
                            {emp.name}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled className="text-muted">
                          No results found
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3 - Remarks */}
            <Row className="gy-3 mt-2 mb-2">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    {" "}
                    <span className="text-danger">*</span>Remarks
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    name="remarks"
                    placeholder="Enter remarks here..."
                    rows={3}
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Optional: Total Time Display */}
            {formData.fromTime && formData.toTime && (
              <Row className="mt-3">
                <Col md={12} className="text-end text-muted">
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
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default CompanyCreateTimesheet;
