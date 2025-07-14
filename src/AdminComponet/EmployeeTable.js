import React from "react";

const EmployeeTable = ({ data ,getEmployee}) => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Employee Table</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Second Name</th>
              <th>Work</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Basic Info</th>
              <th>Favourite Filter</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.cId}>
                <td>{index + 1}</td>
                <td>{item.name || "N/A"}</td>
                <td>{item.secondName || "N/A"}</td>
                <td>{item.work || "N/A"}</td>
                <td>{item.email || "N/A"}</td>
                <td>{item.phone || "N/A"}</td>
                <td>{item.status ? "Active" : "Inactive"}</td>
                <td>{item.basicInfo ? "Yes" : "No"}</td>
                <td>{item.favouriteFilter ? "Yes" : "No"}</td>
                <td onClick={() => getEmployee(item.cId)}>Click Me</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



export default EmployeeTable;
