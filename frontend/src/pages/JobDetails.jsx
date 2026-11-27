import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, BriefcaseBusiness, ArrowLeft } from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

function JobDetails() {
    const { id } = useParams();

    const [job, setJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                setJob(response.data.job);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    const handleApply = async (event) => {
        event.preventDefault();
        setApplying(true);
        setMessage("");
        setError("");

        try {
            const response = await api.post("/applications", {
                jobId: id,
                coverLetter
            });

            setMessage(response.data.message || "Application submitted successfully!");
            setCoverLetter("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to submit your application."
            );
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="page-message">Loading job details...</div>;

    if (!job) {
        return (
            <main className="candidate-container">
                <div className="error-message">{error || "Job not found."}</div>
                <Link to="/jobs" className="text-link"><ArrowLeft size={16} /> Back to jobs</Link>
            </main>
        );
    }

    const salary = job.salary?.min || job.salary?.max
        ? `₹${job.salary?.min?.toLocaleString("en-IN") || "—"} - ₹${job.salary?.max?.toLocaleString("en-IN") || "—"}`
        : "Not disclosed";

    return (
        <main className="candidate-container">
            <Link to="/jobs" className="back-link"><ArrowLeft size={17} /> Back to jobs</Link>

            <section className="job-detail-card">
                <div className="job-detail-header">
                    <div className="company-logo large">
                        {(job.company?.name || "C").charAt(0)}
                    </div>

                    <div>
                        <p className="eyebrow">{job.company?.name || "Company"}</p>
                        <h1>{job.title}</h1>
                        <div className="job-meta">
                            <span><MapPin size={16} /> {job.location || "Location not specified"}</span>
                            <span><BriefcaseBusiness size={16} /> {job.jobType || "Not specified"}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-facts">
                    <div><span>Salary</span><strong>{salary}</strong></div>
                    <div><span>Job Type</span><strong>{job.jobType || "Not specified"}</strong></div>
                    <div><span>Company</span><strong>{job.company?.name || "Not specified"}</strong></div>
                </div>

                <section className="job-description">
                    <h2>Job Description</h2>
                    <p>{job.description || "No description provided."}</p>
                </section>

                {job.requirements?.length > 0 && (
                    <section className="job-description">
                        <h2>Requirements</h2>
                        <ul>
                            {job.requirements.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {job.skills?.length > 0 && (
                    <section className="job-description">
                        <h2>Required Skills</h2>
                        <div className="job-skills">
                            {job.skills.map((skill, index) => (
                                <span key={index}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                <form className="apply-form" onSubmit={handleApply}>
                    <h2>Apply for this Job</h2>
                    <label htmlFor="coverLetter">Cover Letter</label>
                    <textarea
                        id="coverLetter"
                        rows="5"
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        placeholder="Introduce yourself and explain why you're a good fit..."
                    />

                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="primary-button" disabled={applying}>
                        {applying ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default JobDetails;