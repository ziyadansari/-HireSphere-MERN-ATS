import { useEffect, useState } from "react";
import api from "../api/axios";
import JobCard from "../components/JobCard";
import "../styles/Candidate.css";

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSavedJobs = async () => {
        try {
            const response = await api.get("/jobs/saved");
            setSavedJobs(response.data.savedJobs || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load saved jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleRemove = async (jobId) => {
        try {
            await api.delete(`/jobs/${jobId}/save`);
            setSavedJobs(previous =>
                previous.filter(item => item.job?._id !== jobId)
            );
        } catch (err) {
            setError(err.response?.data?.message || "Unable to remove saved job.");
        }
    };

    if (loading) return <div className="page-message">Loading saved jobs...</div>;

    return (
        <main className="candidate-container">
            <section className="jobs-heading">
                <p className="eyebrow">YOUR SHORTLIST</p>
                <h1>Saved Jobs</h1>
                <p>Jobs you've saved for later.</p>
            </section>

            {error && <div className="error-message">{error}</div>}

            {savedJobs.length === 0 ? (
                <div className="empty-state">
                    <h3>No saved jobs yet</h3>
                    <p>Browse jobs and save the ones you're interested in.</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {savedJobs.filter(item => item.job).map(item => (
                        <JobCard
                            key={item._id}
                            job={item.job}
                            saved={true}
                            onSave={handleRemove}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default SavedJobs;