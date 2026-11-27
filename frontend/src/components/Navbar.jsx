
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    LogOut
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../styles/Candidate.css";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const role = user?.role?.toLowerCase();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const getDashboardPath = () => {
        if (role === "candidate") return "/dashboard";
        if (role === "recruiter") return "/recruiter-dashboard";
        if (role === "admin") return "/admin-dashboard";

        return "/";
    };

    return (
        <header className="main-navbar">

            <Link to={getDashboardPath()} className="navbar-brand">
                <span className="brand-icon">
                    <BriefcaseBusiness size={24} />
                </span>

                <span>
                    Hire<span>Sphere</span>
                </span>
            </Link>

            {/* Candidate Navigation */}
            {user && role === "candidate" && (
                <nav className="navbar-links">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/jobs">Browse Jobs</NavLink>
                    <NavLink to="/saved-jobs">Saved Jobs</NavLink>
                    <NavLink to="/my-applications">Applications</NavLink>
                    <NavLink to="/my-interviews">My Interviews</NavLink>
                    <NavLink to="/profile">My Profile</NavLink>
                </nav>
            )}

            {/* Recruiter Navigation */}
            {user && role === "recruiter" && (
                <nav className="navbar-links">
                    <NavLink to="/recruiter-dashboard">Dashboard</NavLink>
                    <NavLink to="/recruiter/company">Company Profile</NavLink>
                    <NavLink to="/recruiter/jobs">Manage Jobs</NavLink>
                    <NavLink to="/recruiter/jobs/create">Post a Job</NavLink>
                    <NavLink to="/recruiter/applicants">Applicants</NavLink>
                    <NavLink to="/recruiter/interviews">Interviews</NavLink>
                </nav>
            )}

            {/* Admin Navigation - routes will be added later */}
            {user && role === "admin" && (
                <nav className="navbar-links">
                    <NavLink to="/admin-dashboard">Dashboard</NavLink>
                    <NavLink to="/admin/users">Manage Users</NavLink>
                    <NavLink to="/admin/companies">Companies</NavLink>
                    <NavLink to="/admin/jobs">Manage Jobs</NavLink>
                </nav>
            )}

            <div className="navbar-actions">
                {user ? (
                    <>
                        <span className="navbar-user">
                            {user.name}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            <LogOut size={17} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-login">
                            Sign In
                        </Link>

                        <Link to="/register" className="primary-button">
                            Get Started
                        </Link>
                    </>
                )}
            </div>

        </header>
    );
}

export default Navbar;
