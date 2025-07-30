import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import PaginationComponent from "../../Pagination/PaginationComponent";
import { Tabs, Tab } from 'react-bootstrap';


import { Modal, Button } from "react-bootstrap";
const CreateCustomer = ({ show, onClose, onSave }) => {
    const [key, setKey] = useState('tab1');


    useEffect(() => {
        if (show) {

        }
    }, [show]);

    const createCustomer = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const form = new FormData(e.target); // Get form data

        const data = Object.fromEntries(form.entries()); // Convert to object
        console.log("Form Data:", data);
        try {
            const response = await axiosInstance.post(`/customer/createCustomer`, data);
            onSave()
        } catch (error) {
            console.error("Error saving lead:", error);
        }

    };

    return (
        <div>
            <Modal show={show} onHide={onClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Create Customer</Modal.Title>
                </Modal.Header>
                <form onSubmit={createCustomer}>
                    <Modal.Body>
                        <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" justify>

                            <Tab eventKey="tab1" title="Customer Info">

                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Company Name</label>
                                            <input className="form-control" name="companyName" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Customer Name</label>
                                            <input className="form-control" name="customerName" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input className="form-control" name="phoneNumber" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input className="form-control" name="email" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Website</label>
                                            <input className="form-control" name="website" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">GSTIN</label>
                                            <input className="form-control" name="gstinNumber" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">PAN Number</label>
                                            <input className="form-control" name="panNumber" />
                                        </div>
                                    </div>
                                </div>

                                <h5>Address</h5>
                                <hr></hr>

                                <div className="container">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" name="address" />
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Country</label>
                                            <input className="form-control" name="country" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">State</label>
                                            <input className="form-control" name="state" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">City</label>
                                            <input className="form-control" name="city" />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Zip Code</label>
                                            <input className="form-control" name="zipCode" />
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
                                                <input className="form-control" name="billingAddress" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing Country</label>
                                                <input className="form-control" name="billingCountry" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing State</label>
                                                <input className="form-control" name="billingState" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing City</label>
                                                <input className="form-control" name="billingCity" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Billing Zip Code</label>
                                                <input className="form-control" name="billingZipCode" />
                                            </div>
                                        </div>

                                        {/* Right Column: Shipping */}
                                        <div className="col-md-6">
                                            <h5>Shipping</h5>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Address</label>
                                                <input className="form-control" name="shippingAddress" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Country</label>
                                                <input className="form-control" name="shippingCountry" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping State</label>
                                                <input className="form-control" name="shippingState" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping City</label>
                                                <input className="form-control" name="shippingCity" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Zip Code</label>
                                                <input className="form-control" name="shippingZipCode" />
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
        </div>
    )
}

export default CreateCustomer;