import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import RegisterVisit from './components/RegisterVisit';
import ProtectedRoutes from './components/ProtectedRoutes';
import VisitsData from './components/VisitsData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route element={<ProtectedRoutes allowedRoles={['delivery']} />}>
          <Route path="/register-visit" element={<RegisterVisit />} />
        </Route>
        <Route element={<ProtectedRoutes allowedRoles={['admin', 'operator']} />}>
          <Route path="/visits-data" element={<VisitsData />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
