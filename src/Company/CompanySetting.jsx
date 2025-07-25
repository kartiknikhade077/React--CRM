import React, { useState, useEffect } from "react";
import CompanySidebar from "./CompanySidebar";
import CompanyTopbar from "./CompanyTopbar";
import Button from "react-bootstrap/Button";
import axiosInstance from "../BaseComponet/axiosInstance";
import { toast } from "react-toastify";

const CompanySetting = () => {
  const [isLoading, setIsLoading] = useState(true);

  // formValues now holds base64 strings for images
  const [formValues, setFormValues] = useState({
    companyId: null,
    userId: null,
    companyName: "",
    companyEmail: "",
    companyLoginEmail: "",
    companyDescription: "",
    favicon: "",
    faviconFile: null,
    mainLogo: "",
    mainLogoFile: null,
    applogo: "",
    applogoFile: null,
    address: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    phoneNumber: "",
    gstinNumber: "",
    defaultTimezone: "",
  });

  const timezones = [
    "Asia/Kolkata",
    "America/New_York",
    "Europe/London",
    "Asia/Dubai",
    "Australia/Sydney",
    "UTC",
  ];

  // 1. Load existing company info
  useEffect(() => {
    axiosInstance
      .get("/company/getCompanyInfo")
      .then((res) => {
        const data = res.data;

        const faviconBase64 = data.favicon
          ? `data:image/png;base64,${data.favicon}`
          : "";
        const mainLogoBase64 = data.mainLogo
          ? `data:image/png;base64,${data.mainLogo}`
          : "";
        const applogoBase64 = data.applogo
          ? `data:image/png;base64,${data.applogo}`
          : "";

        setFormValues({
          companyId: data.companyId,
          userId: data.userId,
          companyName: data.companyName || "",
          companyEmail: data.companyEmail || "",
          companyLoginEmail: data.companyLoginEmail || "",
          companyDescription: data.companyDescription || "",
          favicon: faviconBase64,
          faviconFile: faviconBase64
            ? base64ToFile(faviconBase64, "favicon.png")
            : null,
          mainLogo: mainLogoBase64,
          mainLogoFile: mainLogoBase64
            ? base64ToFile(mainLogoBase64, "mainLogo.png")
            : null,
          applogo: applogoBase64,
          applogoFile: applogoBase64
            ? base64ToFile(applogoBase64, "applogo.png")
            : null,
          address: data.address || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          zipcode: data.zipcode || "",
          phoneNumber: data.phoneNumber || "",
          gstinNumber: data.gstinNumber || "",
          defaultTimezone: data.defaultTimezone || "",
        });
      })
      .catch((err) => {
        console.error("Error loading company info:", err);
        toast.error("Unable to load company settings.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // handle file inputs: read and store as base64 string
  // const handleFileAsBase64 = (e, fieldName) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const base64 = reader.result;
  //     setFormValues((prev) => ({
  //       ...prev,
  //       [fieldName]: base64,
  //       [`${fieldName}File`]: file,
  //     }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleFileAsBase64 = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setFormValues((prev) => ({
        ...prev,
        [fieldName]: base64,
        [`${fieldName}File`]: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (fieldName) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: "",
      [`${fieldName}File`]: null,
    }));
  };

  // 2. PUT JSON payload
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Step 1: Create a clean JSON without base64 or File objects

    const companyInfo = {
      companyId: formValues.companyId,
      userId: formValues.userId,
      companyName: formValues.companyName,
      companyEmail: formValues.companyEmail,
      companyLoginEmail: formValues.companyLoginEmail,
      companyDescription: formValues.companyDescription,
      address: formValues.address,
      country: formValues.country,
      state: formValues.state,
      city: formValues.city,
      zipcode: formValues.zipcode,
      phoneNumber: formValues.phoneNumber,
      gstinNumber: formValues.gstinNumber,
      defaultTimezone: formValues.defaultTimezone,
    };

    // Step 2: Append JSON string
    formData.append("companyInfo", JSON.stringify(companyInfo));

    // Step 3: Append image files if they exist
    if (formValues.faviconFile)
      formData.append("favicon", formValues.faviconFile);
    if (formValues.mainLogoFile)
      formData.append("mainLogo", formValues.mainLogoFile);
    if (formValues.applogoFile)
      formData.append("applogo", formValues.applogoFile);

    try {
      await axiosInstance.put("/company/updateCompanyInfo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Company settings updated.");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update company settings.");
    }
  };

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return (
    <>
      <CompanyTopbar />
      <div className="slidebar-main-div d-flex">
        <CompanySidebar />
        <div className="slidebar-main-div-right-section p-4 w-100">
          <div className="Companalist-main-card mb-4">
            <h2>Company Settings</h2>

            {isLoading ? (
              <p>Loading…</p>
            ) : (
              <>
                {/* IMAGE CHOOSERS */}
                {/* <div className="row my-4">
                  {[
                    { label: "Favicon", field: "favicon" },
                    { label: "Main Logo", field: "mainLogo" },
                    { label: "App logo", field: "applogo" },
                  ].map(({ label, field }) => (
                    <div className="col-md-4" key={field}>
                      <div className="border rounded p-3">
                        <h6>{label}</h6>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control mt-2"
                          onChange={(e) => handleFileAsBase64(e, field)}
                        />
                        <div
                          className="bg-light border rounded mt-2 d-flex justify-content-center align-items-center"
                          style={{ height: 150 }}
                        >
                          {formValues[field] ? (
                            <img
                              src={formValues[field]}
                              alt={label}
                              style={{ maxHeight: "100%" }}
                            />
                          ) : (
                            <span className="text-muted">No image</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div> */}

                <div className="row my-4">
                  {[
                    { label: "Favicon", field: "favicon" },
                    { label: "Main Logo", field: "mainLogo" },
                    { label: "App Logo", field: "applogo" },
                  ].map(({ label, field }) => (
                    <div className="col-md-4" key={field}>
                      <div className="border rounded p-2 position-relative">
                        <h6 className="mb-2">{label}</h6>

                        {/* Remove Button */}
                        {formValues[field] && (
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 text-decoration-none"
                            onClick={() => removeImage(field)}
                            style={{ fontSize: "1.2rem" }}
                          >
                            ✖
                          </button>
                        )}

                        {/* Image Preview or Upload Box */}
                        <div
                          className="border bg-light rounded d-flex justify-content-center align-items-center"
                          style={{ height: 150, cursor: "pointer" }}
                          onClick={() =>
                            document.getElementById(`upload-${field}`).click()
                          }
                        >
                          {formValues[field] ? (
                            <img
                              src={formValues[field]}
                              alt={label}
                              style={{ maxHeight: "100%", maxWidth: "100%" }}
                            />
                          ) : (
                            <div className="text-center text-muted">
                              <div>Click to upload</div>
                              <div className="small">PNG, JPG, GIF</div>
                            </div>
                          )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-${field}`}
                          className="d-none"
                          onChange={(e) => handleFileAsBase64(e, field)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* FORM FIELDS */}
                <form onSubmit={handleSubmit} className="bg-white p-4">
                  {[
                    {
                      label: "* Company Name",
                      name: "companyName",
                      type: "text",
                      required: true,
                    },
                    {
                      label: "* Company Email",
                      name: "companyEmail",
                      type: "email",
                      required: true,
                    },
                    {
                      label: "Login Email",
                      name: "companyLoginEmail",
                      type: "email",
                    },
                  ].map(({ label, name, type, required }) => (
                    <div className="mb-3" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        name={name}
                        value={formValues[name]}
                        onChange={handleChange}
                        className="form-control"
                        required={required}
                      />
                    </div>
                  ))}

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="companyDescription"
                      value={formValues.companyDescription}
                      onChange={handleChange}
                      className="form-control"
                      rows={3}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formValues.address}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    {[
                      { label: "Country", name: "country" },
                      { label: "State", name: "state" },
                      { label: "City", name: "city" },
                    ].map(({ label, name }) => (
                      <div className="col-md-4" key={name}>
                        <label className="form-label">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={formValues[name]}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        name="zipcode"
                        value={formValues.zipcode}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formValues.phoneNumber}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">GSTIN Number</label>
                    <input
                      type="text"
                      name="gstinNumber"
                      value={formValues.gstinNumber}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Default Timezone
                    </label>
                    <select
                      name="defaultTimezone"
                      value={formValues.defaultTimezone}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Select timezone</option>
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      Save Settings
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanySetting;
