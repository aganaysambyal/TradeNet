import React, { useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import categories from "./CategoriesList";
import "./AddProduct.css"; 

function AddProduct() {
  const navigate = useNavigate();
  const [pname, setpname] = useState("");
  const [pdesc, setpdesc] = useState("");
  const [price, setprice] = useState("");
  const [category, setcategory] = useState("");
  const [pimage, setpimage] = useState(null);
  const [pimage2, setpimage2] = useState(null);



  const handleApi = () => {
    const formData = new FormData();
    formData.append("pname", pname);
    formData.append("pdesc", pdesc);
    formData.append("price", category === "Lost & Found" ? "" : price); //price empty
    formData.append("category", category);
    if (pimage) formData.append("pimage", pimage);
    if (pimage2) formData.append("pimage2", pimage2);
    formData.append("userId", localStorage.getItem("userId"));

    axios.post("https://tradenet-1.onrender.com/add-product", formData)
      .then((res) => {
        alert(res.data.message);
        navigate("/");
      })
      .catch(() => {
        alert("Error adding product");
      });
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2 className="card-title">ADD PRODUCT HERE</h2>
        
        <label>Product Name</label>
        <input className="form-control" type="text" placeholder="Enter Product Name" value={pname} onChange={(e) => setpname(e.target.value)} />

        <label>Product Description</label>
        <input className="form-control" type="text" placeholder="Enter Product Description" value={pdesc} onChange={(e) => setpdesc(e.target.value)} />

        <label>Product Category</label>
        <select className="form-control" value={category} onChange={(e) => {
          setcategory(e.target.value);
          setprice("");
        }}>
          <option value="">Select Category</option>
          {categories.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        {category !== "Lost & Found" && (
          <>
            <label>Product Price</label>
            <input className="form-control" type="text" placeholder="Enter Product Price" value={price} onChange={(e) => setprice(e.target.value)} />
          </>
        )}

        <label>Product Image</label>
        <input className="form-control" type="file" onChange={(e) => setpimage(e.target.files[0])} />

        <label>Product Second Image</label>
        <input className="form-control" type="file" onChange={(e) => setpimage2(e.target.files[0])} />

        <button onClick={handleApi} className="btn btn-primary mt-3">SUBMIT</button>
      </div>
    </div>
  );
}

export default AddProduct;
