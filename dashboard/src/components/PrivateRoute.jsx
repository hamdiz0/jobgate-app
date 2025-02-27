import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
