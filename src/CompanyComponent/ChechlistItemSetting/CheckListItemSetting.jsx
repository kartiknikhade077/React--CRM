import React, { useState } from "react";
import CompanySidebar from "../CompanySidebar";
import CompanyTopbar from "../CompanyTopbar";
import ChecklistCategories from "./ChecklistCategories"; // <-- Import the new component
import ChecklistItems from "./ChecklistItems"; // <-- Import the new component
import './CheckListItemSetting.css'; // <-- Import CSS for styling

const CheckListItemSetting = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State to manage which tab is currently active. 'categories' is the default.
  const [activeTab, setActiveTab] = useState('categories');

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <CompanyTopbar onToggle={handleToggle} />
      <div className="slidebar-main-div d-flex">
        <CompanySidebar isCollapsed={isCollapsed} />
        <div className="slidebar-main-div-right-section p-4 w-100">
          
          {/* --- Tab Navigation --- */}
          <div className="checklist-tabs">
            <button
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              CHECKLIST CATEGORIES
            </button>
            <button
              className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              CHECKLIST ITEMS
            </button>
          </div>

          {/* --- Conditional Content Display --- */}
          <div className="checklist-content mt-4">
            {activeTab === 'categories' ? <ChecklistCategories /> : <ChecklistItems />}
          </div>

        </div>
      </div>
    </>
  );
}

export default CheckListItemSetting;