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
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
      <p>Sign Up</p>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <form className="registration-form-container" onSubmit={handleSubmit}>
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
          <button type="submit">Sign Up</button>
        </div>
      </form>
    </div>
  );
};

export default Registration;