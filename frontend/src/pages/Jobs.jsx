import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import api from "../api/axios";
import JobCard from "../components/JobCard";
import "../styles/Candidate.css";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savedIds, setSavedIds] = useState([]);

    const fetchJobs = async (requestedPage = page) => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/jobs", {
                params: {
                    search: search || undefined,
                    location: location || undefined,
                    jobType: jobType || undefined,
                    page: requestedPage,
                    limit: 9
                }
            });

            setJobs(response.data.jobs || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, jobType]);

    useEffect(() => {
        const loadSavedJobs = async () => {
            try {
                const response = await api.get("/jobs/saved");
                const ids = (response.data.savedJobs || [])
                    .map(item => item.job?._id)
                    .filter(Boolean);
                setSavedIds(ids);
            } catch {
                // Saved jobs are optional for displaying the job list.
            }
        };

        loadSavedJobs();
    }, []);


    const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchJobs(1);
};

    const handleSave = async (jobId) => {
        const isSaved = savedIds.includes(jobId);

        try {
            if (isSaved) {
                await api.delete(`/jobs/${jobId}/save`);
                setSavedIds(previous => previous.filter(id => id !== jobId));
            } else {
                await api.post(`/jobs/${jobId}/save`);
                setSavedIds(previous => [...previous, jobId]);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Unable to update saved job.");
        }
    };

    return (
        <main className="candidate-container">
            <section className="jobs-heading">
                <p className="eyebrow">FIND YOUR NEXT OPPORTUNITY</p>
                <h1>Explore Jobs</h1>
                <p>Discover opportunities that match your skills and interests.</p>
            </section>

            <form className="job-search-form" onSubmit={handleSearch}>
                <div className="search-field">
                    <Search size={19} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Job title, company or skills"
                    />
                </div>

                <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Location"
                    className="location-input"
                />

                <button type="submit" className="primary-button">Search Jobs</button>
            </form>

            <div className="jobs-toolbar">
                <h2>Available Jobs</h2>

                <select value={jobType} onChange={e => {
                    setJobType(e.target.value);
                    setPage(1);
                }}>
                    <option value="">All Job Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="page-message">Loading jobs...</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <BriefcaseEmpty />
                    <h3>No jobs found</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {jobs.map(job => (
                        <JobCard
                            key={job._id}
                            job={job}
                            saved={savedIds.includes(job._id)}
                            onSave={handleSave}
                        />
                    ))}
                </div>
            )}

            <div className="pagination">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(current => current - 1)}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(current => current + 1)}
                >
                    Next
                </button>
            </div>
        </main>
    );
}

function BriefcaseEmpty() {
    return <Search size={32} />;
}

export default Jobs;