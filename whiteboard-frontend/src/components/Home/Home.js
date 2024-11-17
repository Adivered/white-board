import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Room from '../Room/Room'; // Import the Room component
import './Home.css';
import makeApiRequest from '../../utils/apiBridge';


const Home = () => {
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if(session){
    setUser(session.name);
    console.log("Session: ", session);
    }
  }, []);


  // Leave Room
  const handleLogout = () => {
    fetch('/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          localStorage.removeItem("session");
          window.location.reload();
          console.log("User logged out successfully");
        } else {
          console.error('Error exitting room:', body.message);
          setErrorMsg(body.error || 'Failed to exit room');
        }
      })
      .catch((err) => {
        console.error('Error exitting room:', err);
        setErrorMsg('An error occurred while exitting the room');
      });
  };

  return (
    <div className='main-container'>
      <div className='header-container'>
        <Header />
      </div>
      <main>
          <div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        <section className="intro">
          <div className="intro-div">
            <p>
              Our Whiteboard app allows you to collaborate in real-time with your team. 
              Draw, write, and brainstorm ideas seamlessly on a digital canvas.
            </p>
          </div>

          <br/> <br/>
          <div className='room'>
          <Room user={user} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;