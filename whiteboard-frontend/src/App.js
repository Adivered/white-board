import './App.css';
import Home from './components/Home/Home';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login/Login';
import Registration from './components/Auth/Registration/Registration';
import WhiteboardContainer from './components/Whiteboard/WhiteboardContainer';
import { useAuth } from './Context/AuthContext';
import Header from './components/Header/Header';
function App() {
  return (
    <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/whiteboard" element={<WhiteboardContainer />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element = {<Registration/>} />
    </Routes>
    </>
  );
}

export default App;
