
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    Users,
    UserRound,
    LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    const roleDetails = {
        admin: {
            title: "Admin Dashboard",
            description: "Manage users, companies and job approvals.",
            icon: <LayoutDashboard size={36} />
        },
        recruiter: {
            title: "Recruiter Dashboard",
            description: "Manage jobs and find the right candidates.",
            icon: <Users size={36} />
        },
        candidate: {
            title: "Candidate Dashboard",
            description: "Explore jobs and manage your applications.",
            icon: <UserRound size={36} />
        }
    };

    const details = roleDetails[user?.role];

    if (!details) {
        return <div className="page-container">Please log in again.</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-welcome">
                <div className="dashboard-icon">{details.icon}</div>
                <p className="eyebrow">HIRESPHERE WORKSPACE</p>
                <h1>Welcome, {user.name}!</h1>
                <p>{details.description}</p>
                <span className="role-badge">{user.role}</span>
            </div>

            <div className="dashboard-info">
                <BriefcaseBusiness size={28} />
                <h2>{details.title}</h2>
                <p>Your workspace is ready.</p>
                {user.role === "candidate" && (
                    <Link to="/jobs" className="primary-btn dashboard-link">
                        Explore Jobs
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
