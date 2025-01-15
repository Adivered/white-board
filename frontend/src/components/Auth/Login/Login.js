import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../../../Context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    errorMsg: '',
  });
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const { email, password, errorMsg } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //'https://white-board-29h1.onrender.com/login'
    fetch('/login', { // CHANGED
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Response:', body);
          localStorage.setItem('session', JSON.stringify(body.session));
          localStorage.setItem('token', JSON.stringify(body.token));
          setAuth(true);
          navigate('/'); // Redirect to homepage
        } else {
          setFormData({ ...formData, errorMsg: body.error });
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        setFormData({ ...formData, errorMsg: 'An error occurred during login' });
      });
  };

  return (
    <div className="login-container">
        <p>Login</p>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete='email'
              value={email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              autoComplete='current-password'
              required
            />
            <button type="submit">Login</button>
          </div>
        </form>
    </div>
  );
};

export default Login;