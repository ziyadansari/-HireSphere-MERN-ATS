import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, BriefcaseBusiness } from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get("/applications/my-applications");
                setApplications(response.data.applications || []);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load applications.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return <div className="page-message">Loading applications...</div>;

    return (
        <main className="candidate-container">
            <section className="jobs-heading">
                <p className="eyebrow">TRACK YOUR PROGRESS</p>
                <h1>My Applications</h1>
                <p>Keep track of the jobs you've applied for.</p>
            </section>

            {error && <div className="error-message">{error}</div>}

            {applications.length === 0 ? (
                <div className="empty-state">
                    <h3>No applications yet</h3>
                    <p>Find a job that matches your skills and submit your first application.</p>
                    <Link to="/jobs" className="primary-button">Explore Jobs</Link>
                </div>
            ) : (
                <div className="applications-list">
                    {applications.map(application => {
                        const job = application.job || {};

                        return (
                            <article className="application-card" key={application._id}>
                                <div className="company-logo">
                                    {(job.company?.name || "C").charAt(0)}
                                </div>

                                <div className="application-info">
                                    <h3>{job.title || "Job title unavailable"}</h3>
                                    <p>{job.company?.name || "Company"}</p>
                                    <div className="job-meta">
                                        <span><MapPin size={15} /> {job.location || "Location not specified"}</span>
                                        <span><BriefcaseBusiness size={15} /> {job.jobType || "Not specified"}</span>
                                    </div>
                                </div>

                                <div className="application-status">
                                    <span className={`status-pill ${(application.status || "pending").toLowerCase()}`}>
                                        {application.status || "Pending"}
                                    </span>
                                    {application.createdAt && (
                                        <small>
                                            Applied: {new Date(application.createdAt).toLocaleDateString()}
                                        </small>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default MyApplications;