import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { Tabs, Tab } from 'react-bootstrap';

const EditCustomer = ({ customer, show, onClose, onUpdated }) => {
  const [formData, setFormData] = useState(customer || {});
 const [key, setKey] = useState('tab1');
  useEffect(() => {
    if (customer) setFormData(customer);
  }, [customer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.defaultValue,
    }));
  };



     const updateCustomerInfo = async (e) => {
          e.preventDefault(); // Prevent default form submission
          const form = new FormData(e.target); // Get form data
  
          const data = Object.fromEntries(form.entries()); // Convert to object
          console.log("Form Data:", data);
          try {
              const response = await axiosInstance.put(`/customer/updateCustomer`, data);
              onClose();
          } catch (error) {
              console.error("Error saving lead:", error);
          }
  
      };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Customer</Modal.Title>
      </Modal.Header>
          <form onSubmit={updateCustomerInfo}>
                    <Modal.Body>
                        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" justify>

                            <Tab eventKey="tab1" title="Customer Info">

                                <div className="container">
                                    <div className="row">
                                        <input type="hidden" name="id" value={formData.id} />
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Company Name</label>
                                            <input className="form-control" name="companyName"   defaultValue={formData.companyName || ""}/>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Customer Name</label>
                                            <input className="form-control" name="customerName" defaultValue={formData.customerName || ""} />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input className="form-control" name="phoneNumber" defaultValue={formData.phoneNumber || ""}  />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input className="form-control" name="email" defaultValue={formData.email || ""}  />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Website</label>
                                            <input className="form-control" name="website" defaultValue={formData.website || ""} />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">GSTIN</label>
                                            <input className="form-control" name="gstinNumber" defaultValue={formData.gstinNumber || ""} />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">PAN Number</label>
                                            <input className="form-control" name="panNumber" defaultValue={formData.panNumber || ""}  />
                                        </div>
                                    </div>
                                </div>

                                <h5>Address</h5>
                                <hr></hr>

                                <div className="container">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" name="Address" defaultValue={formData.address || ""} />
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Country</label>
                                            <input className="form-control" name="country" defaultValue={formData.country || ""} />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">State</label>
                                            <input className="form-control" name="state" defaultValue={formData.state || ""}  />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">City</label>
                                            <input className="form-control" name="city" defaultValue={formData.city || ""}  />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Zip Code</label>
                                            <input className="form-control" name="zipCode" defaultValue={formData.zipCode || ""} />
                                        </div>
                                    </div>
                                </div>
                            </Tab>

                            <Tab eventKey="tab2" title="Billing &  Shipping">

                                <div className="container">
                                    <div className="row">
                                        {/* Left Column: Billing */}
                                        <div className="col-md-6">
                                            <h5>Billing</h5>
                                            <div className="mb-3">
                                                <label className="form-label">Billing Address</label>
                                                <input className="form-control" name="billingAddress" defaultValue={formData.billingAddress || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing Country</label>
                                                <input className="form-control" name="billingCountry" defaultValue={formData.billingCountry || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing State</label>
                                                <input className="form-control" name="billingState" defaultValue={formData.billingState || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing City</label>
                                                <input className="form-control" name="billingCity" defaultValue={formData.billingCity || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing Zip Code</label>
                                                <input className="form-control" name="billingZipCode" defaultValue={formData.billingZipCode || ""} />
                                            </div>
                                        </div>

                                        {/* Right Column: Shipping */}
                                        <div className="col-md-6">
                                            <h5>Shipping</h5>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Address</label>
                                                <input className="form-control" name="shippingAddress"  defaultValue={formData.shippingAddress || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Country</label>
                                                <input className="form-control" name="shippingCountry"  defaultValue={formData.shippingCountry || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping State</label>
                                                <input className="form-control" name="shippingState"  defaultValue={formData.shippingState || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping City</label>
                                                <input className="form-control" name="shippingCity" defaultValue={formData.shippingCity || ""} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Zip Code</label>
                                                <input className="form-control" name="shippingZipCode" defaultValue={formData.shippingZipCode || ""}  />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </Tab>


                        </Tabs>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </Modal.Footer>
                </form>
    </Modal>
  );
};

export default EditCustomer;
