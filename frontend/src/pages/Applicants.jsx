
import { useEffect, useState } from "react";
import {
    Users,
    MapPin,
    Briefcase,
    Mail,
    Eye,
    X
} from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

const statuses = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Selected",
    "Rejected"
];

const Applicants = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const fetchApplications = async () => {
        try {
            setLoading(true);

            const response = await api.get("/applications/recruiter/all");

            setApplications(response.data.applications || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch applicants"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const updateStatus = async (applicationId, status) => {
        try {
            setUpdatingId(applicationId);
            setError("");
            setMessage("");

            const response = await api.patch(
                `/applications/${applicationId}/status`,
                { status }
            );

            setApplications((prev) =>
                prev.map((application) =>
                    application._id === applicationId
                        ? { ...application, status }
                        : application
                )
            );

            if (selectedApplication?._id === applicationId) {
                setSelectedApplication((prev) => ({
                    ...prev,
                    status
                }));
            }

            setMessage(
                response.data.message ||
                "Application status updated successfully"
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update application status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredApplications = applications.filter((application) => {
        const candidateName =
            application.candidate?.name?.toLowerCase() || "";

        const jobTitle =
            application.job?.title?.toLowerCase() || "";

        const email =
            application.candidate?.email?.toLowerCase() || "";

        const searchMatch =
            candidateName.includes(search.toLowerCase()) ||
            jobTitle.includes(search.toLowerCase()) ||
            email.includes(search.toLowerCase());

        const statusMatch =
            filterStatus === "All" ||
            (application.status || "Applied") === filterStatus;

        return searchMatch && statusMatch;
    });

    const getStatusClass = (status) =>
        (status || "Applied").toLowerCase().replaceAll(" ", "-");

    if (loading) {
        return (
            <div className="candidate-container">
                Loading applicants...
            </div>
        );
    }

    return (
        <div className="candidate-container applicants-page">

            <div className="jobs-heading">
                <div>
                    <h1>Applicants Management</h1>
                    <p>Manage candidates who applied for your jobs.</p>
                </div>

                <span>Total Applicants: {applications.length}</span>
            </div>

            {error && (
                <div className="manage-alert error">{error}</div>
            )}

            {message && (
                <div className="manage-alert success">{message}</div>
            )}

            <div className="applicant-filters">
                <input
                    type="text"
                    placeholder="Search candidate, email or job..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            {filteredApplications.length === 0 ? (
                <div className="empty-state">
                    <Users size={40} />
                    <h2>No Applicants Found</h2>
                    <p>Applications for your jobs will appear here.</p>
                </div>
            ) : (
                <div className="applicants-list">
                    {filteredApplications.map((application) => (
                        <div
                            className="applicant-card"
                            key={application._id}
                        >
                            <div className="applicant-card-header">
                                <div className="applicant-avatar">
                                    {application.candidate?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                </div>

                                <div className="applicant-info">
                                    <h2>
                                        {application.candidate?.name ||
                                            "Candidate"}
                                    </h2>

                                    <p>
                                        <Mail size={14} />
                                        {application.candidate?.email ||
                                            "No email"}
                                    </p>
                                </div>

                                <span
                                    className={`applicant-status ${getStatusClass(application.status)}`}
                                >
                                    {application.status || "Applied"}
                                </span>
                            </div>

                            <div className="applicant-job-info">
                                <p>
                                    <Briefcase size={15} />
                                    {application.job?.title ||
                                        "Job unavailable"}
                                </p>

                                <p>
                                    <MapPin size={15} />
                                    {application.job?.location ||
                                        "Location unavailable"}
                                </p>
                            </div>

                            <div className="applicant-card-footer">
                                <select
                                    value={application.status || "Applied"}
                                    disabled={updatingId === application._id}
                                    onChange={(e) =>
                                        updateStatus(
                                            application._id,
                                            e.target.value
                                        )
                                    }
                                >
                                    {statuses.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className="view-applicant-btn"
                                    onClick={() =>
                                        setSelectedApplication(application)
                                    }
                                >
                                    <Eye size={16} />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedApplication && (
                <div
                    className="applicant-modal-overlay"
                    onClick={() => setSelectedApplication(null)}
                >
                    <div
                        className="applicant-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="applicant-modal-header">
                            <h2>Applicant Details</h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedApplication(null)
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h3>
                            {selectedApplication.candidate?.name ||
                                "Candidate"}
                        </h3>

                        <p>
                            Email:{" "}
                            {selectedApplication.candidate?.email ||
                                "Not available"}
                        </p>

                        <p>
                            Job: {selectedApplication.job?.title ||
                                "Not available"}
                        </p>

                        <p>
                            Location: {selectedApplication.job?.location ||
                                "Not available"}
                        </p>

                        <p>
                            Application Status:{" "}
                            {selectedApplication.status || "Applied"}
                        </p>

                        <div className="applicant-modal-section">
                            <h4>Cover Letter</h4>
                            <p>
                                {selectedApplication.coverLetter ||
                                    "No cover letter submitted."}
                            </p>
                        </div>

                        <p>
                            Applied on:{" "}
                            {selectedApplication.createdAt
                                ? new Date(
                                    selectedApplication.createdAt
                                ).toLocaleDateString()
                                : "Not available"}
                        </p>

                        <button
                            type="button"
                            className="cancel-edit-btn"
                            onClick={() =>
                                setSelectedApplication(null)
                            }
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Applicants;
