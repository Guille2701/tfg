import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import MyLoans from './pages/MyLoans';
import Recommendations from './pages/Recommendations';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-[#cfe8d8] text-[#1a3328] min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/biblioteca" element={<Library />} />
            <Route path="/mis-prestamos" element={<MyLoans />} />
            <Route path="/recomendaciones" element={<Recommendations />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;