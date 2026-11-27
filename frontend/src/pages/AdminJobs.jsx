
import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    BriefcaseBusiness,
    MapPin,
    Building2,
    User
} from "lucide-react";

import api from "../api/axios";
import "../styles/AdminJobs.css";

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [totalJobs, setTotalJobs] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);

    const [rejectingJob, setRejectingJob] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/jobs", {
                params: {
                    search,
                    status,
                    page,
                    limit: 10
                }
            });

            setJobs(response.data.jobs || []);
            setTotalJobs(response.data.totalJobs || 0);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [search, status, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    const handleApprove = async (job) => {
        const confirmed = window.confirm(
            `Are you sure you want to approve "${job.title}"?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(job._id);

            await api.patch(`/admin/jobs/${job._id}/approve`);

            await fetchJobs();

            if (selectedJob?._id === job._id) {
                setSelectedJob(null);
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to approve job."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const openRejectForm = (job) => {
        setRejectingJob(job);
        setRejectionReason("");
    };

    const handleReject = async (e) => {
        e.preventDefault();

        if (!rejectionReason.trim()) {
            alert("Please enter a rejection reason.");
            return;
        }

        try {
            setUpdatingId(rejectingJob._id);

            await api.patch(
                `/admin/jobs/${rejectingJob._id}/reject`,
                { reason: rejectionReason.trim() }
            );

            setRejectingJob(null);
            setRejectionReason("");

            if (selectedJob?._id === rejectingJob._id) {
                setSelectedJob(null);
            }

            await fetchJobs();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to reject job."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (job) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${job.title}"?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(job._id);

            await api.delete(`/admin/jobs/${job._id}`);

            if (selectedJob?._id === job._id) {
                setSelectedJob(null);
            }

            await fetchJobs();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to delete job."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getStatusClass = (value) => {
        return value?.toLowerCase() || "pending";
    };

    return (
        <div className="admin-jobs-page">

            {/* Header */}
            <div className="admin-jobs-header">
                <div>
                    <h1>Manage Jobs</h1>
                    <p>Review, approve and manage job postings.</p>
                </div>

                <button
                    className="admin-jobs-refresh"
                    onClick={fetchJobs}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Search and Filter */}
            <div className="admin-jobs-toolbar">

                <form
                    className="admin-jobs-search"
                    onSubmit={handleSearch}
                >
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search by job title..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />

                    <button type="submit">Search</button>
                </form>

                <select
                    className="admin-jobs-filter"
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                >
                    <option value="">All Jobs</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

            </div>

            <div className="admin-jobs-count">
                Total Jobs: <strong>{totalJobs}</strong>
            </div>

            {error && (
                <div className="admin-jobs-error">
                    {error}
                    <button onClick={fetchJobs}>Try Again</button>
                </div>
            )}

            {/* Jobs Table */}
            <div className="admin-jobs-table-card">
                <div className="admin-jobs-table-wrapper">

                    <table className="admin-jobs-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Job Type</th>
                                <th>Posted Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="admin-jobs-empty">
                                        Loading jobs...
                                    </td>
                                </tr>
                            ) : jobs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-jobs-empty">
                                        No jobs found.
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td className="admin-job-title">
                                            {job.title}
                                        </td>

                                        <td>{job.company?.name || "N/A"}</td>

                                        <td>{job.location || "N/A"}</td>

                                        <td>{job.jobType || "N/A"}</td>

                                        <td>{formatDate(job.createdAt)}</td>

                                        <td>
                                            <span className={`admin-job-status ${getStatusClass(job.moderationStatus)}`}>
                                                {job.moderationStatus || "Pending"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="admin-job-actions">

                                                <button
                                                    className="admin-job-view"
                                                    title="View details"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {job.moderationStatus !== "Approved" && (
                                                    <button
                                                        className="admin-job-approve"
                                                        title="Approve job"
                                                        disabled={updatingId === job._id}
                                                        onClick={() => handleApprove(job)}
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}

                                                {job.moderationStatus !== "Rejected" && (
                                                    <button
                                                        className="admin-job-reject"
                                                        title="Reject job"
                                                        disabled={updatingId === job._id}
                                                        onClick={() => openRejectForm(job)}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    className="admin-job-delete"
                                                    title="Delete job"
                                                    disabled={updatingId === job._id}
                                                    onClick={() => handleDelete(job)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>

                {/* Pagination */}
                <div className="admin-jobs-pagination">
                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <div>
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((previous) => previous - 1)}
                        >
                            <ChevronLeft size={17} />
                            Previous
                        </button>

                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((previous) => previous + 1)}
                        >
                            Next
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div
                    className="admin-job-modal-overlay"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="admin-job-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-job-modal-header">
                            <h2>Job Details</h2>

                            <button onClick={() => setSelectedJob(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-job-modal-content">

                            <h3>{selectedJob.title}</h3>

                            <span className={`admin-job-status ${getStatusClass(selectedJob.moderationStatus)}`}>
                                {selectedJob.moderationStatus || "Pending"}
                            </span>

                            <div className="admin-job-modal-details">

                                <div>
                                    <Building2 size={17} />
                                    <div>
                                        <span>Company</span>
                                        <strong>{selectedJob.company?.name || "N/A"}</strong>
                                    </div>
                                </div>

                                <div>
                                    <MapPin size={17} />
                                    <div>
                                        <span>Location</span>
                                        <strong>{selectedJob.location || "N/A"}</strong>
                                    </div>
                                </div>

                                <div>
                                    <BriefcaseBusiness size={17} />
                                    <div>
                                        <span>Job Type</span>
                                        <strong>{selectedJob.jobType || "N/A"}</strong>
                                    </div>
                                </div>

                                <div>
                                    <User size={17} />
                                    <div>
                                        <span>Recruiter</span>
                                        <strong>{selectedJob.recruiter?.name || "N/A"}</strong>
                                    </div>
                                </div>

                                <div>
                                    <span>Recruiter Email</span>
                                    <strong>{selectedJob.recruiter?.email || "N/A"}</strong>
                                </div>

                                <div>
                                    <span>Posted Date</span>
                                    <strong>{formatDate(selectedJob.createdAt)}</strong>
                                </div>

                                <div>
                                    <span>Salary</span>
                                    <strong>
                                        {selectedJob.salary?.min != null ||
                                        selectedJob.salary?.max != null
                                            ? `${selectedJob.salary?.min ?? "N/A"} - ${selectedJob.salary?.max ?? "N/A"}`
                                            : "Not specified"}
                                    </strong>
                                </div>

                            </div>

                            <div className="admin-job-description">
                                <h4>Description</h4>
                                <p>{selectedJob.description || "No description available."}</p>
                            </div>

                            {selectedJob.requirements?.length > 0 && (
                                <div className="admin-job-description">
                                    <h4>Requirements</h4>
                                    <ul>
                                        {selectedJob.requirements.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.rejectionReason && (
                                <div className="admin-job-rejection-reason">
                                    <strong>Rejection Reason</strong>
                                    <p>{selectedJob.rejectionReason}</p>
                                </div>
                            )}

                            <div className="admin-job-modal-actions">
                                {selectedJob.moderationStatus !== "Approved" && (
                                    <button
                                        className="admin-job-approve"
                                        disabled={updatingId === selectedJob._id}
                                        onClick={() => handleApprove(selectedJob)}
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                )}

                                {selectedJob.moderationStatus !== "Rejected" && (
                                    <button
                                        className="admin-job-reject"
                                        disabled={updatingId === selectedJob._id}
                                        onClick={() => openRejectForm(selectedJob)}
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                )}

                                <button
                                    className="admin-job-delete"
                                    disabled={updatingId === selectedJob._id}
                                    onClick={() => handleDelete(selectedJob)}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Form Modal */}
            {rejectingJob && (
                <div
                    className="admin-job-modal-overlay"
                    onClick={() => setRejectingJob(null)}
                >
                    <div
                        className="admin-reject-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-job-modal-header">
                            <h2>Reject Job</h2>

                            <button onClick={() => setRejectingJob(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="admin-reject-form"
                            onSubmit={handleReject}
                        >
                            <p>
                                Enter a reason for rejecting:
                                <strong> {rejectingJob.title}</strong>
                            </p>

                            <textarea
                                rows="5"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this job is being rejected..."
                                required
                            />

                            <button
                                type="submit"
                                disabled={
                                    !rejectionReason.trim() ||
                                    updatingId === rejectingJob._id
                                }
                            >
                                {updatingId === rejectingJob._id
                                    ? "Rejecting..."
                                    : "Confirm Rejection"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminJobs;
