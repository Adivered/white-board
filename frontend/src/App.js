import './App.css';
import Home from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login/Login';
import Registration from './components/Auth/Registration/Registration';
import Header from './components/Header/Header';


function App() {
  return (
    <div className='app-container'>    
      <Header />
      <div className='main-container'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element = {<Registration/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
