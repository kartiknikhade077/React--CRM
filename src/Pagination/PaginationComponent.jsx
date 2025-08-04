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
          {/* Previous button */}
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>
          </li>

          {/* First page */}
          <li className={`page-item ${currentPage === 0 ? "active" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(0)}>
              1
            </button>
          </li>

          {/* Left ellipsis */}
          {currentPage > 2 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {/* Previous page */}
          {currentPage > 1 && currentPage < pageCount - 1 && (
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
              >
                {currentPage}
              </button>
            </li>
          )}

          {/* Current page */}
          {currentPage !== 0 && currentPage !== pageCount - 1 && (
            <li className="page-item active">
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage)}
              >
                {currentPage + 1}
              </button>
            </li>
          )}

          {/* Next page */}
          {currentPage < pageCount - 2 && (
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
              >
                {currentPage + 2}
              </button>
            </li>
          )}

          {/* Right ellipsis */}
          {currentPage < pageCount - 3 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}

          {/* Last page */}
          {pageCount > 1 && (
            <li
              className={`page-item ${
                currentPage === pageCount - 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(pageCount - 1)}
              >
                {pageCount}
              </button>
            </li>
          )}

          {/* Next button */}
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
