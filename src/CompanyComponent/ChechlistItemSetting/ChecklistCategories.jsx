import React, { useState, useEffect } from 'react';
import CreateCategories from './CreateCategories';
import axiosInstance from '../../BaseComponet/axiosInstance';
import { toast } from 'react-toastify';

const ChecklistCategories = () => {
  const [createCategoriesModal, setCreateCategoriesModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // NEW

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [createCategoriesModal]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/kickoff/getCheckListCategory');
      // Sort by sequence/order
      const sorted = [...res.data].sort((a, b) => a.sequence - b.sequence);
      setCategories(sorted);
    } catch (error) {
      setCategories([]);
    }
    setLoading(false);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axiosInstance.delete(`/kickoff/deleteCheckListCategoryById/${categoryId}`);
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category.");
      }
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category); // Set the category to edit
    setCreateCategoriesModal(true); // Open modal
  };

  // Move row up
  const moveUp = async (idx) => {
    if (idx === 0) return;
    const newCategories = [...categories];
    [newCategories[idx - 1], newCategories[idx]] = [newCategories[idx], newCategories[idx - 1]];
    // Recalculate sequence/order
    const updated = newCategories.map((cat, i) => ({
      ...cat,
      sequence: i + 1,
    }));
    setCategories(updated);
    await updateOrderBackend(updated);
  };

  // Move row down
  const moveDown = async (idx) => {
    if (idx === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[idx], newCategories[idx + 1]] = [newCategories[idx + 1], newCategories[idx]];
    // Recalculate sequence/order
    const updated = newCategories.map((cat, i) => ({
      ...cat,
      sequence: i + 1,
    }));
    setCategories(updated);
    await updateOrderBackend(updated);
  };

  // Update backend order
  const updateOrderBackend = async (updated) => {
    try {
      await axiosInstance.put('/kickoff/updateCheckListCategory', updated);
      fetchCategories();
    } catch (error) {
      alert("Failed to update order.");
      fetchCategories();
    }
  };

  return (
    <>
      <div className="Companalist-main-card">
        <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
          <div className="col-md-3">
            <h4>Checklist Categories</h4>
          </div>
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search cateogies.."
                onKeyUp=""
              />
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <button
              className="btn btn-dark me-1"
              onClick={() => setCreateCategoriesModal(true)}
            >
              + New Checklist Category
            </button>
          </div>
        </div>

        <div className="table-main-div">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: "10%" }}></th>
                <th style={{ width: "55%" }}>Category Name</th>
                <th style={{ width: "15%" }}>Order</th>
                <th style={{ width: "20%" }}>Options</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    Categories Not Found
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.categoryId}>
                    {/* Fancy up/down arrows at the start */}
                    <td style={{ width: 40, textAlign: "center" }}>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: idx === 0 ? "#adb5bd" : "#0d6efd",
                          fontSize: 16,
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          padding: 0,
                          marginBottom: 2,
                          lineHeight: 1,
                        }}
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                        tabIndex={-1}
                      >
                        <i className="bi bi-caret-up"></i>
                      </button>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: idx === categories.length - 1 ? "#adb5bd" : "#0d6efd",
                          fontSize: 16,
                          cursor: idx === categories.length - 1 ? "not-allowed" : "pointer",
                          padding: 0,
                          marginTop: 2,
                          lineHeight: 1,
                        }}
                        onClick={() => moveDown(idx)}
                        disabled={idx === categories.length - 1}
                        title="Move Down"
                        tabIndex={-1}
                      >
                        <i className="bi bi-caret-down"></i>
                      </button>
                    </td>
                    {/* Category Name */}
                    <td>{cat.categoryName}</td>
                    {/* Order */}
                    <td>{cat.sequence}</td>
                    {/* Options */}
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => handleEdit(cat)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(cat.categoryId)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CreateCategories
        show={createCategoriesModal}
        onClose={() => {
          setCreateCategoriesModal(false);
          setEditCategory(null); // Reset edit state
        }}
        onCreate={() => fetchCategories()}
        editCategory={editCategory} // Pass editCategory prop
        onUpdate={() => fetchCategories()} // Callback after update
      />
    </>
  );
};

export default ChecklistCategories;