import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Signup.css";

function Signup() {
  const [collegeID, setCollegeID] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const navigate = useNavigate();

  // College ID Validation (Only Numbers)
  const validateCollegeID = (id) => {
    return /^[0-9]+$/.test(id.trim());
  };

  // Handle API Call
  const handleApi = () => {
    if (!collegeID || !password || !contactNumber) {
      alert("All fields are required!");
      return;
    }

    if (!validateCollegeID(collegeID)) {
      alert("Enter a valid College ID !");
      return;
    }

    const email = `${collegeID.trim()}@juitsolan.in`; // Auto-generate email

    const url = "https://tradenet-1.onrender.com/signup";
    const data = {
      username: collegeID.trim(),
      email,
      password,
      contactNumber: contactNumber.trim(),
    };

    axios
      .post(url, data)
      .then((res) => {
        console.log(res.data);
        if (res.data.message) {
          alert(res.data.message);
          if (res.data.message === "User signed up successfully!") {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        console.error("Signup Error:", error.response?.data || error);
        alert(error.response?.data?.message || "An error occurred!");
      });
  };

  return (
    <div className="signup-container">
      <div className="card signup-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">College ID Signup</h2>
          <form>
            <div className="mb-3">
              <label htmlFor="collegeID" className="form-label">College ID *</label>
              <input
                type="text"
                className="form-control"
                id="collegeID"
                value={collegeID}
                onChange={(e) => setCollegeID(e.target.value)}
                placeholder="Enter College ID "
                required
              />
            </div>

            {/* Auto-generated Email Display */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email (Auto-Generated) *</label>
              <input
                type="text"
                className="form-control"
                id="email"
                value={collegeID ? `${collegeID}@juitsolan.in` : ""}
                disabled
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
              <input
                type="text"
                className="form-control"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter Contact Number"
                required
              />
            </div>

            <button type="button" className="btn btn-primary w-100 mb-3" onClick={handleApi}>
              SIGNUP
            </button>

            <div className="text-center">
              <span className="me-2">Already have an account?</span>
              <Link to="/login" className="btn btn-link">LOGIN</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
