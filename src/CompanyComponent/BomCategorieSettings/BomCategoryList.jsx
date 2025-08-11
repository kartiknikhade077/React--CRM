import React, { useEffect, useState } from 'react';
import CompanyTopbar from '../CompanyTopbar';
import CompanySidebar from '../CompanySidebar';
import CreateBomCategory from './CreateBomCategory';
import "./BomCategory.css"
import { toast } from 'react-toastify';
import axiosInstance from '../../BaseComponet/axiosInstance';
import { FaEdit, FaTrash } from 'react-icons/fa';
import UpdateBomCategory from './UpdateBomCategory';

const BomCategorySetting = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategory,setSelectedCategory]= useState(null);


  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/kickoff/getCategoryByCompanyId');
      const responseData = response.data;

      const formattedCategories = Object.keys(responseData).map(key => ({
        name: key
      }));

      setCategories(formattedCategories);

    } catch (error) {
      console.error("Error fetching BOM categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUpdateClick = (category) => {
    setSelectedCategory(category); 
    setShowUpdateModal(true); 
  };

  const handleDelete = async (categoryName) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      const response = await axiosInstance.delete(`/kickoff/deleteBomCategory/${categoryName}`)
      if(response.data){
        toast.success(`${categoryName} deleted Succesfully`);
        fetchCategories();
      }else{
        toast.error('error to delete catogory')
      }
    }
  };

  return (
    <div>

      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section">
          <div className="Checklist-sheet-list-container">
            <div className="Companalist-main-card">
              <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
                <div className="col-md-3">
                  <h4>BOM Categories</h4>
                </div>
                <div className="col-md-5 d-flex justify-content-end">
                  <button
                    className="btn btn-dark"
                    onClick={() => setShowCreateModal(true)}
                  >
                    + Create Category
                  </button>
                </div>
              </div>

              <div className="table-main-div">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: '85%' }}>Category Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="2" className="text-center">Loading categories...</td>
                      </tr>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.name}>
                          <td>{category.name}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Edit Category"
                              onClick={() => handleUpdateClick(category.name)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Category"
                              onClick={() => handleDelete(category.name)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center">No Categories found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateBomCategory
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={() => setShowCreateModal(false)}
      />

      <UpdateBomCategory
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            onSaveSuccess={fetchCategories}
            categoryToUpdate={selectedCategory}
          />
    </div>
  );
}

export default BomCategorySetting;