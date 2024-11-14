import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Room from '../Room/Room'; // Import the Room component
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token: ", token);
    if (token) {
      fetch('http://10.0.0.2:5000/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
          if (status === 200) {
            setUser(body.user);
          } else {
            setErrorMsg(body.msg || 'Failed to fetch user data');
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          setErrorMsg('An error occurred while fetching user data');
        });
    }
  }, []);

  return (
    <div className='main-container'>
      <div className='header-container'>
        <Header />
      </div>
      <main>
        <section className="intro">
          <h1>Whiteboard.io</h1>
          <p>
            Our Whiteboard app allows you to collaborate in real-time with your team. 
            Draw, write, and brainstorm ideas seamlessly on a digital canvas.
          </p>
          <Room user={user} />
        </section>
      </main>
    </div>
  );
};

export default Home;