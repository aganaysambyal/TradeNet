import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaTrash } from "react-icons/fa";
import "./Home.css";

function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .post("https://tradenet-1.onrender.com/my-products", { userId })
      .then((res) => {
        if (res.data.products) {
          setProducts(res.data.products);
          setFilteredProducts(res.data.products);
        }
      })
      .catch(() => alert("Server Error"));
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          product.pname.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, products]);

  const handleLike = (productId) => {
    let userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please log in to like a product.");
      return;
    }

    if (!productId) {
      alert("Invalid product ID.");
      return;
    }

    if (likedProducts.has(productId)) {
      alert("You have already liked this product.");
      return;
    }

    axios
      .post("https://tradenet-1.onrender.com/like-product", { userId, productId })
      .then((res) => {
        alert(res.data.message || "Product liked!");
        setLikedProducts((prevLiked) => {
          const updatedLikes = new Set(prevLiked);
          updatedLikes.add(productId);
          localStorage.setItem("likedProducts", JSON.stringify([...updatedLikes]));
          return updatedLikes;
        });
      })
      .catch((err) => {
        alert("Server Error: " + (err.response?.data?.message || "Try again later"));
      });
  };

  const handleRemove = (productId) => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      alert("Please log in to delete a product.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    axios.delete(`https://tradenet-1.onrender.com/delete-product/${productId}`, {
      data: { userId }
    })
    .then((res) => {
      alert(res.data.message);
      setProducts(prev => prev.filter(p => p._id !== productId));
      setFilteredProducts(prev => prev.filter(p => p._id !== productId));
    })
    .catch(err => {
      alert("Error: " + (err.response?.data?.message || "Failed to delete"));
    });
  };

  useEffect(() => {
    const storedLikedProducts = JSON.parse(localStorage.getItem("likedProducts")) || [];
    setLikedProducts(new Set(storedLikedProducts));
  }, []);

  return (
    <div className="home-container">
      <button className="go-home-btn" onClick={() => navigate("/")}>🏠 Go to Home</button>
      <Header search={search} handleSearch={setSearch} handleClick={() => {}} />

      {localStorage.getItem("token") && (
        <Link className="add-product-btn" to="/add-product">
          ADD PRODUCT
        </Link>
      )}

      <h5 className="all-results-title">ALL RESULTS</h5>
      <div className="product-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
            <div className="card" key={index}>
              <div onClick={() => handleLike(item._id)} className="icon-con">
                <FaHeart className={`icons ${likedProducts.has(item._id) ? "liked" : ""}`} />
              </div>
              <img className="product-image" src={item.pimage} alt="Product" />

              <p><strong>Name:</strong> {item.pname}</p>
              <p><strong>Description:</strong> {item.pdesc}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <h3 className="text-success">
                {item.category === "Lost & Found"
                  ? item.addedBy?.contactNumber
                    ? `Contact: ${item.addedBy.contactNumber}`
                    : "Contact details not available"
                  : `Rs.${item.price}`}
              </h3>


              <button className="remove-btn" onClick={() => handleRemove(item._id)}>
                <FaTrash /> Remove
              </button>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
}

export default MyProducts;
