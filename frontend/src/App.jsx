import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import Register from "./pages/RegisterPage.jsx";
import ResetPassword from "./pages/ResetPasswordPage.jsx";
import AdminEmails from './pages/AdminEmailsPage.jsx';
import ContaPage from './pages/ContaPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <Link to="/">Login</Link>
        <Link to="/cadastro">Cadastro</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/emails" element={<AdminEmails />} />
        <Route path="/conta" element={<ContaPage />} />
      </Routes>
    </BrowserRouter>
  );
}
