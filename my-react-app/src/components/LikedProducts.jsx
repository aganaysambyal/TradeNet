import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import "./Home.css";

function LikedProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [search, setSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .post("https://tradenet-1.onrender.com/liked-products", { userId })
      .then((res) => {
        if (res.data.products) {
          setProducts(res.data.products);
          setFilteredProducts(res.data.products);
          const likedSet = new Set(res.data.products.map((p) => p._id));
          setLikedProducts(likedSet);
        }
      })
      .catch(() => alert("Server Error"));
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredProducts(products);
      setHasSearched(false);
    } else {
      const filtered = products.filter((product) =>
        product.pname.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
      setHasSearched(true);
    }
  }, [search, products]);

  const handleLike = (productId) => {
    let userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please log in to like or dislike a product.");
      return;
    }

    if (!productId) {
      alert("Invalid product ID.");
      return;
    }

    const isLiked = likedProducts.has(productId);
    const endpoint = isLiked ? "unlike-product" : "like-product";
    const successMessage = isLiked ? "Product unliked!" : "Product liked!";

    axios
      .post(`https://tradenet-1.onrender.com/${endpoint}`, { userId, productId })
      .then((res) => {
        alert(res.data.message || successMessage);
        setLikedProducts(prev => {
          const updated = new Set(prev);
          isLiked ? updated.delete(productId) : updated.add(productId);

          // Update localStorage immediately
          const arrayForm = Array.from(updated);
          localStorage.setItem("likedProducts", JSON.stringify(arrayForm));

          return updated;
        });

        // Remove unliked product from view immediately
        if (isLiked) {
          setProducts(prev => prev.filter(p => p._id !== productId));
          setFilteredProducts(prev => prev.filter(p => p._id !== productId));
        }
      })
      .catch((err) => {
        alert("Server Error: " + (err.response?.data?.message || "Try again later"));
      });
  };


  useEffect(() => {
    const storedLikedProducts =
      JSON.parse(localStorage.getItem("likedProducts")) || [];
    setLikedProducts(new Set(storedLikedProducts));
  }, []);

  return (
    <div className="home-container">
      <button className="go-home-btn" onClick={() => navigate("/")}>🏠 Go to Home</button>
      <Header search={search} handleSearch={setSearch} handleClick={() => { }} />

      {localStorage.getItem("token") && (
        <Link className="add-product-btn" to="/add-product">ADD PRODUCT</Link>
      )}

      <h5 className="all-results-title">ALL RESULTS</h5>
      <div className="product-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
            <div className="card" key={index}>
              <div onClick={() => handleLike(item._id)} className="icon-con">
                <FaHeart
                  className={`icons ${likedProducts.has(item._id) ? "liked" : ""}`}
                  style={{ color: likedProducts.has(item._id) ? "red" : "gray" }}
                />
              </div>
              <img className="product-image" src={item.pimage} alt="Product" />


              <p><strong>Name:</strong> {item.pname}</p>
              <p><strong>Description:</strong> {item.pdesc}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <h3 className="text-success">
                {item.category === "Lost & Found" ?
                  item.contactDetails ? `Contact: ${item.contactDetails}` : "Contact details unavailable"
                  : `Rs.${item.price}`}
              </h3>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
}

export default LikedProducts;