import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BriefcaseBusiness,
    Bookmark,
    FileText,
    UserRound,
    ArrowRight
} from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

function CandidateDashboard() {
    const [profile, setProfile] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get("/users/profile"),
                    api.get("/jobs?limit=3"),
                    api.get("/applications/my-applications"),
                    api.get("/jobs/saved")
                ]);

                if (results[0].status === "fulfilled") {
                    setProfile(results[0].value.data.user || results[0].value.data.profile || null);
                }

                if (results[1].status === "fulfilled") {
                    setJobs(results[1].value.data.jobs || []);
                }

                if (results[2].status === "fulfilled") {
                    const data = results[2].value.data;
                    setApplications(data.applications || []);
                }

                if (results[3].status === "fulfilled") {
                    const data = results[3].value.data;
                    setSavedJobs(data.savedJobs || []);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) return <div className="page-message">Loading dashboard...</div>;

    const displayName = profile?.name || "Candidate";

    return (
        <main className="candidate-container">
            <section className="welcome-section">
                <div>
                    <p className="eyebrow">CANDIDATE DASHBOARD</p>
                    <h1>Welcome back, {displayName}!</h1>
                    <p>Find opportunities and manage your job applications.</p>
                </div>

                <Link to="/jobs" className="primary-button">
                    Explore Jobs <ArrowRight size={17} />
                </Link>
            </section>

            {error && <div className="error-message">{error}</div>}

            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><BriefcaseBusiness /></div>
                    <div>
                        <p>Available Jobs</p>
                        <h2>{jobs.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple"><FileText /></div>
                    <div>
                        <p>My Applications</p>
                        <h2>{applications.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange"><Bookmark /></div>
                    <div>
                        <p>Saved Jobs</p>
                        <h2>{savedJobs.length}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green"><UserRound /></div>
                    <div>
                        <p>Profile</p>
                        <h2>{profile ? "Active" : "Incomplete"}</h2>
                    </div>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h2>Latest Job Opportunities</h2>
                        <p>Explore recently posted jobs.</p>
                    </div>
                    <Link to="/jobs" className="text-link">View all jobs <ArrowRight size={16} /></Link>
                </div>

                <div className="dashboard-job-list">
                    {jobs.length > 0 ? jobs.map(job => (
                        <Link to={`/jobs/${job._id}`} className="dashboard-job-row" key={job._id}>
                            <div className="company-logo">{(job.company?.name || "C").charAt(0)}</div>
                            <div className="dashboard-job-info">
                                <h3>{job.title}</h3>
                                <p>{job.company?.name || "Company"} · {job.location || "Location not specified"}</p>
                            </div>
                            <ArrowRight size={18} />
                        </Link>
                    )) : <p className="empty-message">No jobs available right now.</p>}
                </div>
            </section>
        </main>
    );
}

export default CandidateDashboard;