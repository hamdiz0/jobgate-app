import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import UsersComponent from "./components/UsersComponent";
import PlacesComponent from "./components/PlacesComponent";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersComponent />} />
          <Route path="places" element={<PlacesComponent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
