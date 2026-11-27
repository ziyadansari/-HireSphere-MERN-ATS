
import { useEffect, useState } from "react";
import {
    Users,
    UserRound,
    Building2,
    BriefcaseBusiness,
    FileText,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    UserCog
} from "lucide-react";

import api from "../api/axios";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/dashboard");

            setDashboard(response.data.dashboard);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const applicationStatuses = [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Selected",
        "Rejected"
    ];

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                Loading Admin Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-container">
                <p>{error}</p>
                <button onClick={fetchDashboard}>
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    if (!dashboard) return null;

    const { users, companies, jobs, applications } = dashboard;

    const statistics = [
        {
            title: "Total Users",
            value: users.total,
            icon: Users,
            color: "blue"
        },
        {
            title: "Candidates",
            value: users.candidates,
            icon: UserRound,
            color: "purple"
        },
        {
            title: "Recruiters",
            value: users.recruiters,
            icon: UserCog,
            color: "orange"
        },
        {
            title: "Companies",
            value: companies.total,
            icon: Building2,
            color: "green"
        },
        {
            title: "Total Jobs",
            value: jobs.total,
            icon: BriefcaseBusiness,
            color: "pink"
        },
        {
            title: "Applications",
            value: applications.total,
            icon: FileText,
            color: "cyan"
        }
    ];

    return (
        <div className="admin-dashboard">

            {/* Header */}
            <div className="admin-dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Monitor and manage your HireSphere platform.</p>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={fetchDashboard}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="admin-stats-grid">

                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div className="admin-stat-card" key={item.title}>
                            <div className={`admin-stat-icon ${item.color}`}>
                                <Icon size={23} />
                            </div>

                            <div>
                                <p>{item.title}</p>
                                <h2>{item.value}</h2>
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Company and Job Statistics */}
            <div className="admin-overview-grid">

                <div className="admin-panel">
                    <h2>Company Overview</h2>

                    <div className="admin-overview-row">
                        <span>Total Companies</span>
                        <strong>{companies.total}</strong>
                    </div>

                    <div className="admin-overview-row">
                        <span>Approved Companies</span>
                        <strong className="success-text">
                            {companies.approved}
                        </strong>
                    </div>

                    <div className="admin-overview-row">
                        <span>Pending Approval</span>
                        <strong className="warning-text">
                            {companies.pending}
                        </strong>
                    </div>
                </div>

                <div className="admin-panel">
                    <h2>Job Overview</h2>

                    <div className="admin-overview-row">
                        <span>Total Jobs</span>
                        <strong>{jobs.total}</strong>
                    </div>

                    <div className="admin-overview-row">
                        <span>Active Jobs</span>
                        <strong className="success-text">
                            {jobs.active}
                        </strong>
                    </div>

                    <div className="admin-overview-row">
                        <span>Inactive Jobs</span>
                        <strong className="danger-text">
                            {jobs.inactive}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Application Statistics */}
            <div className="admin-panel admin-applications-panel">
                <h2>Applications Overview</h2>

                <div className="admin-application-grid">

                    {applicationStatuses.map((status) => (
                        <div
                            className="admin-application-item"
                            key={status}
                        >
                            <span>{status}</span>

                            <strong>
                                {applications.byStatus?.[status] || 0}
                            </strong>
                        </div>
                    ))}

                </div>
            </div>

            {/* Recent Users */}
            <div className="admin-panel admin-table-panel">
                <h2>Recent Registered Users</h2>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Registered</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dashboard.recentUsers?.length > 0 ? (
                                dashboard.recentUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`admin-role ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="admin-empty">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Companies */}
            <div className="admin-panel admin-table-panel">
                <div className="admin-panel-heading">
                    <h2>Recent Pending Companies</h2>
                    <span className="pending-count">
                        {companies.pending} Pending
                    </span>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Owner</th>
                                <th>Email</th>
                                <th>Registered</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dashboard.recentPendingCompanies?.length > 0 ? (
                                dashboard.recentPendingCompanies.map((company) => (
                                    <tr key={company._id}>
                                        <td>{company.name}</td>
                                        <td>{company.owner?.name || "N/A"}</td>
                                        <td>{company.owner?.email || "N/A"}</td>
                                        <td>{formatDate(company.createdAt)}</td>
                                        <td>
                                            <span className="pending-badge">
                                                <Clock size={13} />
                                                Pending
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="admin-empty">
                                        No pending companies.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

export default AdminDashboard;
