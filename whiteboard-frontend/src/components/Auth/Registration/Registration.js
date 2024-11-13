import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';
const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    errorMsg: '',
  });

  const navigate = useNavigate();

  const { name, email, password, errorMsg } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://172.20.10.2:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          navigate('/login'); // Redirect to login page
        } else {
          setFormData({ ...formData, errorMsg: body.msg });
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        setFormData({ ...formData, errorMsg: 'An error occurred during registration' });
      });
  };

  return (
    <div className="registration-container">
      <h2>Sign Up</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
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
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Registration;