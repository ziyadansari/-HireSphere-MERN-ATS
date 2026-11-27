
import { useEffect, useState } from "react";
import {
    Briefcase,
    MapPin,
    Building2,
    Trash2,
    Edit,
    X
} from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

const initialForm = {
    title: "",
    description: "",
    requirements: "",
    skills: "",
    location: "",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    applicationDeadline: ""
};

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingJob, setEditingJob] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const fetchJobs = async () => {
        try {
            setLoading(true);

            const response = await api.get("/jobs/my-jobs");

            setJobs(response.data.jobs || []);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to fetch jobs"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (job) => {
        setEditingJob(job);

        setForm({
            title: job.title || "",
            description: job.description || "",
            requirements: (job.requirements || []).join("\n"),
            skills: (job.skills || []).join(", "),
            location: job.location || "",
            jobType: job.jobType || "Full-time",
            salaryMin: job.salary?.min ?? "",
            salaryMax: job.salary?.max ?? "",
            applicationDeadline: job.applicationDeadline
                ? job.applicationDeadline.slice(0, 10)
                : ""
        });

        setMessage("");
        setError("");
    };

    const closeEditor = () => {
        setEditingJob(null);
        setForm(initialForm);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const min = Number(form.salaryMin) || 0;
        const max = Number(form.salaryMax) || 0;

        if (min > max) {
            setError("Minimum salary cannot be greater than maximum salary.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                requirements: form.requirements
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                skills: form.skills
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                location: form.location.trim(),
                jobType: form.jobType,
                salary: {
                    min,
                    max
                },
                applicationDeadline: form.applicationDeadline || undefined
            };

            const response = await api.put(
                `/jobs/${editingJob._id}`,
                payload
            );

            setMessage(
                response.data.message ||
                "Job updated successfully. Waiting for admin approval."
            );

            closeEditor();
            await fetchJobs();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update job"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (job) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${job.title}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            const response = await api.delete(`/jobs/${job._id}`);

            setMessage(response.data.message || "Job deleted successfully.");

            if (editingJob?._id === job._id) {
                closeEditor();
            }

            await fetchJobs();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to delete job"
            );
        }
    };

    const getStatusClass = (status) => {
        return status?.toLowerCase() || "pending";
    };

    if (loading) {
        return (
            <div className="candidate-container">
                Loading jobs...
            </div>
        );
    }

    return (
        <div className="candidate-container manage-jobs-page">

            <div className="jobs-heading">
                <div>
                    <h1>Manage Jobs</h1>
                    <p>View and manage the jobs posted by you.</p>
                </div>

                <span>Total Jobs: {jobs.length}</span>
            </div>

            {error && (
                <div className="manage-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="manage-alert success">
                    {message}
                </div>
            )}

            {editingJob && (
                <div className="profile-section edit-job-section">
                    <div className="edit-job-heading">
                        <h2>Edit Job</h2>

                        <button
                            type="button"
                            className="close-edit-btn"
                            onClick={closeEditor}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div className="profile-field">
                            <label>Job Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label>Requirements (one per line)</label>
                            <textarea
                                name="requirements"
                                value={form.requirements}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label>Skills (comma separated)</label>
                            <input
                                name="skills"
                                value={form.skills}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label>Location</label>
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label>Job Type</label>
                            <select
                                name="jobType"
                                value={form.jobType}
                                onChange={handleChange}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div className="salary-fields">
                            <div className="profile-field">
                                <label>Minimum Salary</label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    min="0"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Maximum Salary</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    min="0"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="profile-field">
                            <label>Application Deadline</label>
                            <input
                                type="date"
                                name="applicationDeadline"
                                value={form.applicationDeadline}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-job-actions">
                            <button
                                type="button"
                                className="cancel-edit-btn"
                                onClick={closeEditor}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-edit-btn"
                                disabled={saving}
                            >
                                {saving ? "Updating..." : "Update Job"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={40} />
                    <h2>No Jobs Posted Yet</h2>
                    <p>Your posted jobs will appear here.</p>
                </div>
            ) : (
                <div className="manage-jobs-list">
                    {jobs.map((job) => (
                        <div className="manage-job-card" key={job._id}>
                            <div className="manage-job-header">
                                <div>
                                    <h2>{job.title}</h2>

                                    <p>
                                        <Building2 size={15} />
                                        {job.company?.name || "Company"}
                                    </p>

                                    <p>
                                        <MapPin size={15} />
                                        {job.location}
                                    </p>
                                </div>

                                <span className={`job-status ${getStatusClass(job.moderationStatus)}`}>
                                    {job.moderationStatus}
                                </span>
                            </div>

                            <p className="manage-job-description">
                                {job.description}
                            </p>

                            <div className="manage-job-footer">
                                <span>{job.jobType}</span>

                                <span>
                                    ₹{(job.salary?.min || 0).toLocaleString("en-IN")}
                                    {" - "}
                                    ₹{(job.salary?.max || 0).toLocaleString("en-IN")}
                                </span>
                            </div>

                            {job.rejectionReason && (
                                <p className="job-rejection-reason">
                                    Rejection reason: {job.rejectionReason}
                                </p>
                            )}

                            <div className="manage-job-actions">
                                <button
                                    type="button"
                                    className="edit-job-btn"
                                    onClick={() => handleEdit(job)}
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="delete-job-btn"
                                    onClick={() => handleDelete(job)}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageJobs;
