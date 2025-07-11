import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleApi = () => {
    const url = 'https://tradenet-1.onrender.com/login';
    const data = { username, password };

    axios
      .post(url, data)
      .then((res) => {
        console.log(res.data);

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userId', res.data.userId);
          localStorage.setItem('userName', res.data.username);
          alert('Login successful!');
          navigate('/');
        } else {
          alert(res.data.message);
        }
      })
      .catch(() => {
        alert('Incorrect Username or Password');
      });
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Welcome to Login Page!</h2>
          <form>
            <div className="mb-3">
              <label className="text-white"> ID / Email</label>
              <input
                type="text"
                className="form-control text-white"
                placeholder="Enter College ID or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="text-white">Password</label>
              <input
                type="password"
                className="form-control text-white"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary w-100 mb-3"
              onClick={handleApi}
            >
              LOGIN
            </button>
            <div className="text-center">
              <span className="me-2 text-white">Don't have an account?</span>
              <Link to="/signup" className="btn btn-link">
                SIGN UP
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
