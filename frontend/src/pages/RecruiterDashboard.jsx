
import { useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    Users,
    CalendarDays,
    Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function RecruiterDashboard() {
    const [dashboard, setDashboard] = useState({
        jobs: { total: 0, active: 0, inactive: 0 },
        applications: { total: 0, byStatus: {} },
        interviews: {
            total: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/recruiter/dashboard");

                setDashboard(response.data.dashboard);
            } catch (error) {
                console.error("Dashboard error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="page-message">Loading dashboard...</div>;
    }

    return (
        <main className="candidate-container">
            <section className="jobs-heading">
                <p className="eyebrow">RECRUITER PANEL</p>
                <h1>Welcome to HireSphere Recruiter Dashboard</h1>
                <p>Manage your company, jobs and candidates.</p>
            </section>

            {error && (
                <p className="error-message">{error}</p>
            )}

            <div className="dashboard-stats">

                <div className="stat-card">
                    <BriefcaseBusiness />
                    <h3>My Jobs</h3>
                    <h2>{dashboard.jobs.total}</h2>
                    <p>
                        Active: {dashboard.jobs.active} |
                        Inactive: {dashboard.jobs.inactive}
                    </p>
                </div>

                <div className="stat-card">
                    <Users />
                    <h3>Total Applicants</h3>
                    <h2>{dashboard.applications.total}</h2>
                </div>

                <div className="stat-card">
                    <CalendarDays />
                    <h3>Interviews</h3>
                    <h2>{dashboard.interviews.total}</h2>
                    <p>
                        Scheduled: {dashboard.interviews.scheduled}
                    </p>
                </div>

                <div className="stat-card">
                    <Building2 />
                    <h3>Company</h3>
                    <h2>
                        <Link to="/recruiter/company">Manage</Link>
                    </h2>
                </div>

            </div>
        </main>
    );
}

export default RecruiterDashboard;
