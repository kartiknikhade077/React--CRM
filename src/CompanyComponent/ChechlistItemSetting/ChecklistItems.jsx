import React, { useState, useEffect, use } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import { toast } from 'react-toastify';
import CreateCheckListItem from './CreateCheckListItem'; // Adjust the import path as necessary

const emptyItem = { order: "", itemName: "" };

const ChecklistItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createItemModal, setCreateItemModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [usedOrders, setUsedOrders] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/kickoff/getCheckListCategoryAndItem');
      // Sort by sequence/order
      const sorted = [...(res.data || [])].sort((a, b) => a.sequence - b.sequence);
      // Map API fields to table fields
      setItems(
        sorted.map(item => ({
          ...item,
          categoryName: item.categoryType,
          itemName: item.checkListItem,
        }))
      );
      const orderList = sorted.map(item => item.sequence);
      setUsedOrders(orderList);
    } catch (error) {
      setItems([]);
    }
    setLoading(false);
  };

  // Move row up
  const moveUp = async (idx) => {
    if (idx === 0) return;
    const newItems = [...items];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    // Recalculate sequence/order
    const updated = newItems.map((item, i) => ({
      ...item,
      sequence: i + 1,
    }));
    setItems(updated);
    await updateOrderBackend(updated);
  };

  // Move row down
  const moveDown = async (idx) => {
    if (idx === items.length - 1) return;
    const newItems = [...items];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    // Recalculate sequence/order
    const updated = newItems.map((item, i) => ({
      ...item,
      sequence: i + 1,
    }));
    setItems(updated);
    await updateOrderBackend(updated);
  };

  // Update backend order
  const updateOrderBackend = async (updated) => {
    try {
      await axiosInstance.put('/kickoff/updateCheckListCategoryWithItem', updated);
      fetchItems();
    } catch (error) {
      toast.error("Failed to update order.");
      fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setCreateItemModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axiosInstance.delete(`/kickoff/deleteCheckListItem/${itemId}`);
        toast.success("Item deleted successfully!");
        fetchItems();
      } catch (error) {
        toast.error("Failed to delete item.");
      }
    }
  };

  return (
    <div className="Companalist-main-card">
      <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-2">
        <div className="col-md-3">
          <h4>Checklist Items</h4>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search items..."
              // onChange={}
            />
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <button
            className="btn btn-dark me-1"
            onClick={() => {
              setEditItem(null);
              setCreateItemModal(true);
            }}
          >
            + New Checklist Item
          </button>
        </div>
      </div>

      <div className="table-main-div">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ width: "10%" }}></th>
              <th style={{ width: "30%" }}>Category Name</th>
              <th style={{ width: "30%" }}>Item Name</th>
              <th style={{ width: "15%" }}>Order</th>
              <th style={{ width: "15%" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  Items Not Found
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.itemId}>
                  {/* Up/Down arrows */}
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
                        color: idx === items.length - 1 ? "#adb5bd" : "#0d6efd",
                        fontSize: 16,
                        cursor: idx === items.length - 1 ? "not-allowed" : "pointer",
                        padding: 0,
                        marginTop: 2,
                        lineHeight: 1,
                      }}
                      onClick={() => moveDown(idx)}
                      disabled={idx === items.length - 1}
                      title="Move Down"
                      tabIndex={-1}
                    >
                      <i className="bi bi-caret-down"></i>
                    </button>
                  </td>
                  <td>{item.categoryName}</td>
                  <td>{item.itemName}</td>
                  <td>{item.sequence}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(item.itemId)}
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

      <CreateCheckListItem
        show={createItemModal}
        onClose={() => {
          setCreateItemModal(false);
          setEditItem(null);
        }}
        onCreate={() => fetchItems()}
        editItem={editItem}
        onUpdate={() => {
          fetchItems()
          toast.success(editItem ? "Item updated successfully!" : "Item created successfully!");
        }}
        usedOrders={usedOrders}
      />
    </div>
  );
};

export default ChecklistItems;