import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Room from '../Room/Room'; // Import the Room component
import './Home.css';
import makeApiRequest from '../../utils/apiBridge';
import { useAuth } from '../../Context/AuthContext';


const Home = () => {
  //const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const {auth, user} = useAuth();


  useEffect(() => {
    if(auth){
      const session = JSON.parse(localStorage.getItem('session'));
      //console.log("User logged: ", user);
    }
  }, [user, auth]);


  // Leave Room
  

  return (
    <div className='main-container'>
      <main>
        <section className="intro">
          <div className="intro-div">
            <p>
              Our Whiteboard app allows you to collaborate in real-time with your team. 
              Draw, write, and brainstorm ideas seamlessly on a digital canvas.
            </p>
          </div>

          <br/> <br/>
          <div className='room'>
          <Room user={user || null} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;