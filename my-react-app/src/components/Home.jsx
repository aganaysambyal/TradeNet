import React, { useState, useEffect } from 'react';
import Header from "./Header";
import Categories from "./Categories";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cproducts, setcProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [likedProducts, setLikedProducts] = useState(new Set());

  useEffect(() => {
    axios.get('https://tradenet-1.onrender.com/get-products')
      .then((res) => {
        console.log("Fetched Products:", res.data);
        if (res.data.products) {
          setProducts(res.data.products);
          setOriginalProducts(res.data.products);
          setcProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.error("Server Error:", err);
        alert('Server Error');
      });
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    axios.post("https://tradenet-1.onrender.com/liked-products", { userId })
      .then((res) => {
        if (res.data.products) {
          const likedSet = new Set(res.data.products.map((p) => p._id));
          setLikedProducts(likedSet);
        }
      })
      .catch((err) => console.error("Error fetching liked products:", err));
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim() === '') {
        setcProducts(originalProducts);
        setHasSearched(false);
      } else {
        axios.get(`https://tradenet-1.onrender.com/search-products?query=${search}`)
          .then((res) => {
            setcProducts(res.data.products);
            setHasSearched(true);
          })
          .catch(() => {
            alert('Server Error');
          });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, originalProducts]);

  const handleClearSearch = () => {
    setSearch('');
    setcProducts(originalProducts);
    setHasSearched(false);
  };

  const handleCategory = (value) => {
    let filteredProducts = originalProducts.filter((item) => item.category === value);
    setcProducts(filteredProducts);
    setHasSearched(true);
  };

  const handleLike = (productId, e) => {
    e.stopPropagation();
    const userId = localStorage.getItem('userId');
  
    if (!userId) {
      alert('Please log in to like/dislike a product.');
      return;
    }
  
    const isLiked = likedProducts.has(productId);
    const endpoint = isLiked ? "unlike-product" : "like-product";
    const successMessage = isLiked ? "Product unliked!" : "Product liked!";
  
    axios.post(`https://tradenet-1.onrender.com/${endpoint}`, { userId, productId })
      .then((res) => {
        setLikedProducts(prev => {
          const updated = new Set(prev);
          isLiked ? updated.delete(productId) : updated.add(productId);
          return updated;
        });
        alert(res.data.message || successMessage);
      })
      .catch((err) => {
        alert('Server Error: ' + (err.response?.data?.message || 'Try again later'));
      });
  };

  const handleProduct = (id) => {
    if (!id) {
      console.error("Product ID is missing!");
      return;
    }
    navigate(`/product/${id}`);
  };

  return (
    <div className="home-container">
      <Header search={search} handleSearch={setSearch} />

      <div className="categories-container">
        <Categories handleCategory={handleCategory} />
      </div>

      {hasSearched && (
        <div className="search-results-container">
          <button onClick={handleClearSearch} className="clear-search-btn">Clear Search</button>
          {cproducts && <h5 className="searched-results-title">SEARCHED RESULTS</h5>}
          {cproducts && products.length === 0 && <h5 className="searched-results-title">No RESULTS</h5>}
        </div>
      )}

      <div className="product-container">
        {hasSearched ? (
          cproducts.length > 0 ? (
            cproducts.map((item) => (
              <div className="card" key={item._id} onClick={() => handleProduct(item._id)}>
                <div className="icon-con" onClick={(e) => handleLike(item._id, e)}>
                  <FaHeart 
                    className={`icons ${likedProducts.has(item._id) ? "liked" : ""}`} 
                    style={{ color: likedProducts.has(item._id) ? "red" : "gray" }} 
                  />
                </div>
                <img className="product-image" src={item.pimage} alt="Product" />

                <p>{item.pname}</p>
                <h3 className="text-success">{item.price}</h3>
              </div>
            ))
          ) : (
            <p>No products found</p>
          )
        ) : (
          products.map((item) => (
            <div className="card" key={item._id} onClick={() => handleProduct(item._id)}>
              <div className="icon-con" onClick={(e) => handleLike(item._id, e)}>
                <FaHeart 
                  className={`icons ${likedProducts.has(item._id) ? "liked" : ""}`} 
                  style={{ color: likedProducts.has(item._id) ? "red" : "gray" }} 
                />
              </div>
              <img className="product-image" src={item.pimage} alt="Product" />

              <p>{item.pname}</p>
              {item.category !== "Lost & Found" && <h3 className="text-success">Rs. {item.price}</h3>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
