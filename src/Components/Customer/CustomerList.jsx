import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import PaginationComponent from "../../Pagination/PaginationComponent";
import { Button } from "react-bootstrap";
import CompanySidebar from "../../CompanyComponent/CompanySidebar";
import CompanyTopbar from "../../CompanyComponent/CompanyTopbar";
import EditCustomer from "./EditCustomer";
import CreateCustomer from "./CreateCustomer";
import "./CustomerList.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CustomerList = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [customers, setCustomer] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [access,setAccess]=useState({})

    useEffect(() => {
       
        fetchCustomers(page, size);
        const access = JSON.parse(localStorage.getItem("access"));
        setAccess(access)
    }, [page, size]);


    const fetchCustomers = async (page, size) => {
        try {
            const response = await axiosInstance.get(`/customer/getAllCustomer/${page}/${size}`);
            setCustomer(response.data.customerList);
            setTotalPages(response.data.totalPages)
           console.log(access)

        } catch (error) {
            console.error("Failed to fetch Leads:", error);
        }
    };

     const searchCustomers = async (search) => {
        try {
            const response = await axiosInstance.get(`/customer/getAllCustomer/${page}/${size}?name=${search}`);
            setCustomer(response.data.customerList);
            setTotalPages(response.data.totalPages)


        } catch (error) {
            console.error("Failed to fetch Leads:", error);
        }
    };

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSaveLead = () => {

        fetchCustomers(page, size);
        setShowModal(false)
    }

    const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
     fetchCustomers(page, size);
    setSelectedCustomer(null);
  };


const handleToggleStatus = async (customerId, newStatus) => {
  try {
    const customerToUpdate = customers.find((c) => c.id === customerId);

    const updatedCustomer = {
      ...customerToUpdate,
      status: newStatus,
    };

    const response = await axiosInstance.put(
      `/customer/updateCustomer`,
      updatedCustomer
    );

    if (response.status === 200) {
      toast.success("Customer status updated");
      setCustomer((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c))
      );
    }
  } catch (error) {
    console.error("Error updating customer status:", error);
    toast.error("Failed to update status");
  }
};



    return (
      <div>
        

          <div className="slidebar-main-div-right-section">
            <div className="Companalist-main-card">
              <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                <div className="col-md-3">
                  <h4>Customers</h4>
                </div>

                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search Company Name"
                      onKeyUp={(e) => searchCustomers(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-end">
                 {access?.customerCreate && ( <button
                    className="btn btn-dark"
                    onClick={() => setShowModal(true)}
                  >
                    + Customer
                  </button>
                 )}
                </div>
              </div>

              <div className="table-main-div">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Created Date</th>
                      <th>Company</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Status</th>

                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer, index) => (
                        <tr key={customer.id}>
                          <td>{index + 1}</td>
                          <td>{customer.createdDate}</td>
                          <td>{customer.companyName}</td>
                          <td>{customer.phoneNumber}</td>
                          <td>{customer.email}</td>
                          <td>
                            <label className="Company-customerList-switch">
                              <input
                                type="checkbox"
                                checked={customer.status}
                                onChange={() =>
                                  handleToggleStatus(
                                    customer.id,
                                    !customer.status
                                  )
                                }
                              />
                              <span className="Company-customerList-slider Company-customerList-round"></span>
                            </label>
                          </td>

                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleEditClick(customer)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          Customers Not Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pagination-main-crd">
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
        

        {/* Create Lead Modal */}
        <CreateCustomer
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveLead}
        />

        <EditCustomer
          customer={selectedCustomer}
          show={showEditModal}
          onSave={handleCloseEditModal}
          onClose={handleCloseEditModal}
        />
      </div>
    );

}

export default CustomerList;