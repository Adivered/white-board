import React, { useState, useEffect } from 'react';
import Room from '../Room/Room'; // Import the Room component
import './Home.css';
import { useAuth } from '../../Context/AuthContext';

const Home = () => {
  const {user} = useAuth();

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
          { user ?
            (  
              <>         
              <br/> <br/>
              <div className='room'>
                <Room user={user || null} />
              </div>
            </>
            ) : <></>
          }

        </section>
      </main>
    </div>
  );
};

export default Home;