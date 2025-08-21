import React, { useEffect, useState } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import PaginationComponent from "../../Pagination/PaginationComponent";
import Button from "react-bootstrap/Button";
import CompanyCreateProject from "../../CompanyComponent/Project/CompanyCreateProject";
import CompanyEditProject from "../../CompanyComponent/Project/CompanyEditProject";

const ProjectList = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [access,setAccess]=useState({})


  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    fetchProjects();
    const access = JSON.parse(localStorage.getItem("access"));
    setAccess(access)
  }, [currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get(
        `/project/getAllProjects/${currentPage}/${pageSize}`
      );
      const data = response.data;

      setProjects(data.projectList || []);
      setPageCount(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <div>
   

        <div className="slidebar-main-div-right-section">
          <div className="Companalist-main-card">
            <div className="row m-0 p-0 w-100 d-flex justify-content-between mb-3">
              <div className="col-md-6">
                <h4>Project List</h4>
              </div>
              <div className="col-md-3 d-flex justify-content-end">
                  {access?.projectCreate && ( <Button 
                  className="btn btn-dark"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Project
                </Button>
                  )}
              </div>
            </div>

            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Billing Type</th>
                  <th>Estimate</th>
                  <th>Estimate Hours</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.projectId}>
                      <td>{project.projectName}</td>
                      <td>{project.projectStatus}</td>
                      <td>{project.billingType}</td>
                      <td>{project.projectEstimate}</td>
                      <td>{project.estimateHours}</td>
                      <td>{project.startDate}</td>
                      <td>{project.endDate}</td>

                      <td className="text-end">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setSelectedProjectId(project.projectId);
                            setShowEditModal(true);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-main-crd">
            <PaginationComponent
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setCurrentPage(0);
                setPageSize(size);
              }}
            />
          </div>
        
      </div>

      <CompanyCreateProject
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={fetchProjects} // refresh list
      />

      {showEditModal && (
        <CompanyEditProject
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          projectId={selectedProjectId}
          onProjectUpdated={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectList;
