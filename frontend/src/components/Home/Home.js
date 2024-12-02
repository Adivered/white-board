import React from 'react';
import Room from '../Room/Room'; // Import the Room component
import './Home.css';
import { useAuth } from '../../Context/AuthContext';
import RoomProvider from '../../Context/RoomContext';
import { NavLink } from 'react-router-dom'

const AuthScreen = () => {

  return (
    <div className="login-section">
      <p className="login-description">
        Log in or sign up to start collaborating in real time. Join the conversation, brainstorm ideas, and bring your creativity to life!
      </p>
      <div className="login-buttons">
        <NavLink className="login-btn" to="/login">Log In</NavLink>
        <NavLink className="signup-btn" to="/signup">Sign Up</NavLink>
      
      </div>
    </div>
  );
}
const Hero = () => {
  return (
    <div className="hero">
        <div className="projector-top">
          <div className="projector-hanger"></div>
          <div className="projector-hanger-line"></div>
          <div className="projector-top-bar"></div>

        </div>
        <div className="projector-screen">
          <div className="hero-p">
            <p>Our Whiteboard app allows you to collaborate in real-time with your team.</p>
            <p>Draw, write, and brainstorm ideas seamlessly on a digital canvas!</p>
          </div>
          <AuthScreen/>
        </div>
    </div>
  );
}

const RoomObj = ({isDimmed}) => {
  return (
      <div className={`room ${isDimmed ? 'dimmed' : ''}`}>
        <RoomProvider>
          <Room />
        </RoomProvider>
    </div>
  )
}

const Home = () => {
  let userObj = null;
  const {user} = useAuth();

  if (localStorage.getItem('session')) {
    console.log('Session: ', JSON.parse(localStorage.getItem('session')));
    userObj = JSON.parse(localStorage.getItem('session')).name;
  } else {
    console.log("Overridinng user")
    userObj = user;
  }

  console.log("User obj: ", userObj);
  console.log("User: ", user);

  return (
    <>
      <RoomObj isDimmed={userObj ? false : true}/>
      {userObj ? null : <Hero />}
    </>
  );
};

export default Home;