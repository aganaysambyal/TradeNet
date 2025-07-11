import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./ProductDetail.css";
import io from 'socket.io-client';
import { jwtDecode } from "jwt-decode"; // Correct


let socket;

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [msg, setmsg] = useState('');
  const [msgs, setmsgs] = useState([]);
  const { productId } = useParams();
  const [contactDetails, setContactDetails] = useState(null);
  const messagesEndRef = useRef(null); 
  const [showChat, setShowChat] = useState(false); 

  useEffect(() => {
    socket = io('https://tradenet-1.onrender.com');


    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('joinProductRoom', productId); 
    });

    socket.on('getMsg', (data) => {
      setmsgs(data); 
    });

    return () => {
      socket.disconnect(); 
    };
  }, [productId]);

  const handleSend = () => {
    const data = {
      username: localStorage.getItem('userName'),
      msg,
      productId, 
    };

    socket.emit('sendMsg', data);
    setmsg('');
  };

  const handleDeleteChat = () => {
    socket.emit('deleteAllMsgs', productId); 
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    const url = `https://tradenet-1.onrender.com/get-product/${productId}`;
    axios
      .get(url)
      .then((res) => {
        if (res.data.product) {
          setProduct(res.data.product);
          setContactDetails(res.data.product.contactDetails);
        }
      })
      .catch(() => alert("Server Error"));
  }, [productId]);

  // Check if the user is logged in by verifying JWT token
  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);  

      // Check if token has expired
      if (decoded.exp < Date.now() / 1000) {
        return false; // Token is expired
      }
      return true;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  const userLoggedIn = isLoggedIn(); // Check if logged in

  return (
    <div className="product-detail-container">
      <div className="product-card">
        <h2>PRODUCT DETAILS:</h2>
        {product ? (
          <>
            {selectedImage && (
              <div className="image-modal" onClick={() => setSelectedImage(null)}>
                <span className="close-modal">&times;</span>
                <img
                  src={selectedImage}
                  alt="Enlarged view"
                  className="modal-content"
                />
              </div>
            )}

            <div className="image-container">
  {product.pimage && (
    <img
      src={product.pimage}
      alt={product.pname}
      className="product-image"
      onClick={() => setSelectedImage(product.pimage)}
    />
  )}

  {product.pimage2 ? (
    <img
      src={product.pimage2}
      alt={product.pname}
      className="product-image2"
      onClick={() => setSelectedImage(product.pimage2)}
    />
  ) : (
    <p className="no-image">No second image available</p>
  )}
</div>


            <div className="product-info">
              <p><strong>Name:</strong> {product.pname}</p>
              <p><strong>Description:</strong> {product.pdesc}</p>
              <p><strong>Category:</strong> {product.category}</p>

              {contactDetails && (
                <p><strong>Contact:</strong> {contactDetails}</p>
              )}
            </div>

            {/* Only show the chat toggle button if the user is logged in */}
            {userLoggedIn && (
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat ? "Hide Chat" : "Show Chat"}
                </button>
              </div>
            )}

            {/* Chat Section (conditionally rendered) */}
            {showChat && (
              <div className="chat-section">
                <h3 style={{ color: 'white' }}>CHATS</h3>

                {msgs.length > 0 && (
                  <button
                    className="delete-chat-btn delete-message-btn"
                    onClick={handleDeleteChat}
                  >
                    Delete Chat
                  </button>
                )}

                <div className="chat-messages">
                  {msgs && msgs.length > 0 &&
                    msgs.map((item, index) => {
                      const currentUser = localStorage.getItem('userName');
                      const isOwner = product.username === item.username;
                      const isCurrentUser = currentUser === item.username;

                      return (
                        <div key={index} className={isOwner ? "owner-message" : "user-message"}>
                          <p>{item.username}: {item.msg}</p>
                        </div>
                      );
                    })
                  }
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                  <input
                    value={msg}
                    onChange={(e) => setmsg(e.target.value)}
                    className="form-control"
                    type="text"
                  />
                  <button onClick={handleSend} className="btn btn-primary">SEND</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="loading-message">Loading product details...</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
