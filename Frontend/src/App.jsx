import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
//import Sidebar from './components/Sidebar';
import "bootstrap/dist/css/bootstrap.min.css";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Redirecionamento Inicial: Sempre que alguém entrar na raiz ('/'), o sistema envia para '/login' */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* 2. Rota de Login: Define que o componente Login deve ser renderizado neste caminho */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
