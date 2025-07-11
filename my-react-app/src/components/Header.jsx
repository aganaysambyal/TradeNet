import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { FaShoppingCart } from "react-icons/fa";
import juitLogo from "./juit.jpg"; // import your image here

function Header(props) {
  const [showOver, setShowOver] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("likedProducts");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOver(false);
      }
    };

    if (showOver) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOver]);

  return (
    <header
      style={{
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "1rem",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <h1 style={{
        textAlign: "center",
        fontSize: "2.5rem",
        fontWeight: "bold",
        color: "#000000",
        padding: "12px 18px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }}>
        <FaShoppingCart style={{ fontSize: "2.2rem", color: "#FFD700" }} />
        Welcome to the JUIT TRADENET
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={props.search}
          onChange={(e) =>
            props.handleSearch && props.handleSearch(e.target.value)
          }
          style={{
            padding: "8px",
            borderRadius: "5px 0 0 5px",
            border: "1px solid #ccc",
            height: "40px",
            width: "200px",
          }}
        />
        <button
          className="btn btn-primary"
          onClick={props.handleClick}
          style={{
            height: "40px",
            padding: "8px 16px",
            borderRadius: "0 5px 5px 0",
            border: "1px solid #ccc",
            borderLeft: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
          }}
        >
          Search
        </button>

        {!isLoggedIn && (
          <>
            <Link to="/login" style={{ marginLeft: "10px" }}>
              Login
            </Link>
            <Link to="/signup" style={{ marginLeft: "10px" }}>
              Sign Up
            </Link>
          </>
        )}

<img
  src={juitLogo}
  alt="User Menu"
  onClick={() => setShowOver(!showOver)}
  style={{
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    cursor: "pointer",
    objectFit: "cover",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "2px solid #FFD700",
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  }}
/>


        {showOver && (
          <div
            ref={dropdownRef}
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              top: "60px",
              right: "10px",
              width: "220px",
              background: "#2c3e50",
              color: "#fff",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              borderRadius: "8px",
              zIndex: "1500",
              padding: "10px",
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            {isLoggedIn ? (
              <>
                <Link
                  to="/liked-products"
                  style={{
                    color: "white",
                    padding: "12px",
                    textDecoration: "none",
                    transition: "0.3s",
                  }}
                >
                  ❤️ FAVOURITES
                </Link>

                <Link
                  to="/my-products"
                  style={{
                    color: "white",
                    padding: "12px",
                    textDecoration: "none",
                    transition: "0.3s",
                  }}
                >
                  📢 My Ads
                </Link>

                <Link
                  to="/add-product"
                  style={{
                    color: "white",
                    padding: "12px",
                    textDecoration: "none",
                    transition: "0.3s",
                  }}
                >
                  ➕ Add Product
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    color: "white",
                    padding: "12px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    transition: "0.3s",
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => alert("Login required to view liked products")}
                  style={{
                    color: "white",
                    padding: "12px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    transition: "0.3s",
                  }}
                >
                  ❤️ FAVOURITES
                </button>
                <button
                  onClick={() => alert("Login required to add a product")}
                  style={{
                    color: "white",
                    padding: "12px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    transition: "0.3s",
                  }}
                >
                  ➕ Add Product
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
