import React, { useState, useEffect } from 'react';
import Header from "./Header";
import Categories from "./Categories";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import './Home.css';

function CategoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cproducts, setcProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    axios.get('https://tradenet-1.onrender.com/get-products')
      .then((res) => {
        if (res.data.products) {
          setProducts(res.data.products);
          setOriginalProducts(res.data.products);
          setcProducts(res.data.products); 
        }
      })
      .catch(() => {
        alert('Server Error');
      });
  }, []);

  const handleClick = () => {
    if (search.trim() === '') {
      setcProducts(originalProducts); 
      setHasSearched(false);
      return;
    }


    const url = 'https://tradenet-1.onrender.com/search?search=' + search + '&loc=' + localStorage.getItem('userLoc');
    axios.get(url)
      .then((res) => {
        setcProducts(res.data.products);
        setHasSearched(true); 
      })
      .catch((err) => {
        alert('Server Error');
      });
  };

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
    let userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Please log in to like a product.');
      return;
    }

    axios.post('https://tradenet-1.onrender.com/like-product', { userId, productId })
      .then((res) => {
        alert(res.data.message || 'Product liked!');
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
      <Header search={search} handleSearch={setSearch} handleClick={handleClick} />

     
      <div className="categories-container">
        <Categories handleCategory={handleCategory} />
        <div className="buttons-container">
          {localStorage.getItem('token') && (
            <>
              <Link className="add-product-btn" to="/add-product">ADD PRODUCT</Link>
              <Link className="liked-product-btn" to="/liked-products">LIKED PRODUCT</Link>
            </>
          )}
        </div>
      </div>

      
      {hasSearched && (
        <div className="search-results-container">
          <button onClick={handleClearSearch} className="clear-search-btn">Clear Search</button>
          { cproducts && <h5 className="searched-results-title">SEARCHED RESULTS</h5>}
          { cproducts && products.length == 0 && <h5 className="searched-results-title">No RESULTS</h5>}
        </div>
      )}

      
      <div className="product-container">
        {hasSearched ? (
          cproducts.length > 0 ? (
            cproducts.map((item) => (
              <div className="card" key={item._id} onClick={() => handleProduct(item._id)}>
                <div className="icon-con" onClick={(e) => handleLike(item._id, e)}>
                  <FaHeart className="icons" />
                </div>
                <img className="product-image" src={'https://tradenet-1.onrender.com/uploads/' + item.pimage} alt="Product" />
                <p>{item.pname}</p>
                <p className="text-success">{item.pdesc}</p>
                <h3 className="text-success">{item.price}</h3>
                <p className="text-danger">{item.category}</p>
              </div>
            ))
          ) : (
            <p>No products found</p>
          )
        ) : (
          products.map((item) => (
            <div className="card" key={item._id} onClick={() => handleProduct(item._id)}>
              <div className="icon-con" onClick={(e) => handleLike(item._id, e)}>
                <FaHeart className="icons" />
              </div>
              <img className="product-image" src={'https://tradenet-1.onrender.com/uploads/' + item.pimage} alt="Product" />
              <p>{item.pname}</p>
              <p className="text-success">{item.pdesc}</p>
              <h3 className="text-success">{item.price}</h3>
              <p className="text-danger">{item.category}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryPage;