import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./pages/MainLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Clients from "./pages/Clients";
import NewLeads from "./components/NewLeads";
import "bootstrap/dist/css/bootstrap.min.css";
import EditLead from "./components/EditLead";
import LeadDetails from "./components/LeadDetails";

function App() {
  const isDevelopment = import.meta.env.DEV;

  return (
    <BrowserRouter basename={isDevelopment ? "/" : "/LuisF-proj4"}>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Rotas Públicas (Sem Header/Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/new" element={<NewLeads />} />
          <Route path="/leads/edit/:id" element={<EditLead />} />
          <Route path="/leads/:id" element={<LeadDetails />} />

          <Route path="/clients" element={<Clients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
