// src/components/common/PaginationComponent.jsx
import React from "react";

const PaginationComponent = ({
  currentPage,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
      {/* Rows per page */}
      <div className="d-flex align-items-center gap-2">
        <label htmlFor="pageSizeInput" className="form-label mb-0">
          Rows per page:
        </label>
        <input
          type="number"
          id="pageSizeInput"
          className="form-control"
          style={{ width: "100px" }}
          value={pageSize}
          onChange={(e) => {
            const newSize = parseInt(e.target.value);
            if (!isNaN(newSize) && newSize > 0) {
              onPageSizeChange(newSize);
            }
          }}
        />
      </div>

      {/* Pagination */}
      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>
          </li>

          {[...Array(pageCount).keys()].map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(number)}
              >
                {number + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === pageCount - 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === pageCount - 1}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PaginationComponent;
