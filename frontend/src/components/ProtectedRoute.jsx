
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    const token = localStorage.getItem("token");

    if (loading) {
        return <div className="page-message">Checking authentication...</div>;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = String(user.role || "").toLowerCase();

    const permittedRoles = allowedRoles.map(role =>
        String(role).toLowerCase()
    );

    if (!permittedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
