
import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    User,
    Briefcase,
    Video,
    MapPin,
    X
} from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";


const initialForm = {
  applicationId: "",
  scheduledAt: "",
  duration: 30,
  interviewType: "Online",
  meetingLink: "",
  location: "",
  round: 1,
  notes: ""
};

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingInterview, setEditingInterview] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const fetchInterviews = async () => {
        try {
            const response = await api.get("/interviews/recruiter");
            setInterviews(response.data.interviews || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch interviews"
            );
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await api.get("/applications/recruiter/all");

            setApplications(
                (response.data.applications || []).filter(
                    (application) =>
                        !["Rejected"].includes(application.status)
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to fetch applicants"
            );
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([
            fetchInterviews(),
            fetchApplications()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const openScheduleForm = () => {
        setEditingInterview(null);
        setForm(initialForm);
        setShowForm(true);
        setError("");
        setMessage("");
    };

    const openRescheduleForm = (interview) => {
        setEditingInterview(interview);

        const localDate = new Date(
            new Date(interview.scheduledAt).getTime() -
            new Date().getTimezoneOffset() * 60000
        ).toISOString().slice(0, 16);

        setForm({
            ...initialForm,
            scheduledAt: localDate,
            duration: interview.duration || 30,
            meetingLink: interview.meetingLink || "",
            location: interview.location || "",
            notes: interview.notes || ""
        });

        setShowForm(true);
        setError("");
        setMessage("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingInterview(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setMessage("");

            if (editingInterview) {
                await api.patch(
                    `/interviews/${editingInterview._id}/reschedule`,
                    {
                        scheduledAt: new Date(form.scheduledAt).toISOString(),
                        duration: Number(form.duration),
                        meetingLink: form.meetingLink,
                        location: form.location,
                        notes: form.notes
                    }
                );

                setMessage("Interview rescheduled successfully.");
            } else {
                await api.post("/interviews", {
                    ...form,
                    scheduledAt: new Date(form.scheduledAt).toISOString(),
                    duration: Number(form.duration)
                });

                setMessage("Interview scheduled successfully.");
            }

            closeForm();
            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save interview"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this interview?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/interviews/${id}/cancel`
            );

            setMessage(
                response.data.message || "Interview cancelled successfully."
            );

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel interview"
            );
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm("Mark this interview as completed?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/interviews/${id}/complete`
            );

            setMessage(
                response.data.message || "Interview completed successfully."
            );

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to complete interview"
            );
        }
    };

    const getStatusClass = (status) =>
        (status || "Scheduled").toLowerCase();

    if (loading) {
        return (
            <div className="candidate-container">
                Loading interviews...
            </div>
        );
    }

    return (
        <div className="candidate-container interviews-page">

            <div className="jobs-heading">
                <div>
                    <h1>Interview Management</h1>
                    <p>Schedule and manage candidate interviews.</p>
                </div>

                <button
                    className="schedule-interview-btn"
                    onClick={openScheduleForm}
                >
                    + Schedule Interview
                </button>
            </div>

            {error && (
                <div className="manage-alert error">{error}</div>
            )}

            {message && (
                <div className="manage-alert success">{message}</div>
            )}

            {showForm && (
                <div className="profile-section interview-form-section">
                    <div className="edit-job-heading">
                        <h2>
                            {editingInterview
                                ? "Reschedule Interview"
                                : "Schedule Interview"}
                        </h2>

                        <button
                            type="button"
                            className="close-edit-btn"
                            onClick={closeForm}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {!editingInterview && (
                            <div className="profile-field">
                                <label>Select Applicant</label>

                                <select
                                    name="applicationId"
                                    value={form.applicationId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Choose an applicant
                                    </option>

                                    {applications.map((application) => (
                                        <option
                                            key={application._id}
                                            value={application._id}
                                        >
                                            {application.candidate?.name}
                                            {" - "}
                                            {application.job?.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="profile-field">
                            <label>Interview Date & Time</label>

                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                value={form.scheduledAt}
                                onChange={handleChange}
                                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                                    .toISOString().slice(0, 16)}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label>Duration (minutes)</label>

                            <input
                                type="number"
                                name="duration"
                                min="1"
                                value={form.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!editingInterview && (
                            <>
                                <div className="profile-field">
                                    <label>Interview Type</label>

                                            <select
  name="interviewType"
  value={form.interviewType}
  onChange={handleChange}
>
  <option value="Online">Online</option>
  <option value="In-person">In-person</option>
  <option value="Phone">Phone</option>
</select>
                                </div>

                                <div className="profile-field">
                                    <label>Interview Round</label>

                                 <input
  type="number"
  name="round"
  min="1"
  value={form.round}
  onChange={handleChange}
/>
                                </div>
                            </>
                        )}

                        {form.interviewType === "Online" && (
                            <div className="profile-field">
                                <label>Meeting Link</label>

                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={form.meetingLink}
                                    onChange={handleChange}
                                    placeholder="https://meet.google.com/..."
                                />
                            </div>
                        )}

                        {form.interviewType === "Offline" && (
                            <div className="profile-field">
                                <label>Interview Location</label>

                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Office address"
                                />
                            </div>
                        )}

                        <div className="profile-field">
                            <label>Notes</label>

                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Additional interview instructions..."
                            />
                        </div>

                        <div className="edit-job-actions">
                            <button
                                type="button"
                                className="cancel-edit-btn"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-edit-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingInterview
                                        ? "Reschedule"
                                        : "Schedule Interview"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {interviews.length === 0 ? (
                <div className="empty-state">
                    <CalendarDays size={40} />
                    <h2>No Interviews Scheduled</h2>
                    <p>Schedule interviews with your applicants here.</p>
                </div>
            ) : (
                <div className="interviews-list">
                    {interviews.map((interview) => (
                        <div
                            className="interview-card"
                            key={interview._id}
                        >
                            <div className="interview-card-header">
                                <div>
                                    <h2>
                                        {interview.candidate?.name ||
                                            "Candidate"}
                                    </h2>

                                    <p>
                                        <Briefcase size={15} />
                                        {interview.job?.title ||
                                            "Job unavailable"}
                                    </p>

                                    <p>
                                        <User size={15} />
                                        {interview.candidate?.email ||
                                            "No email"}
                                    </p>
                                </div>

                                <span
                                    className={`interview-status ${getStatusClass(interview.status)}`}
                                >
                                    {interview.status}
                                </span>
                            </div>

                            <div className="interview-details">
                                <p>
                                    <CalendarDays size={16} />
                                    {new Date(
                                        interview.scheduledAt
                                    ).toLocaleString()}
                                </p>

                                <p>
                                    <Clock size={16} />
                                    {interview.duration || 30} minutes
                                </p>

                                <p>
                                    {interview.interviewType === "Online"
                                        ? <Video size={16} />
                                        : <MapPin size={16} />}
                                    {interview.interviewType || "Not specified"}
                                </p>

                                {interview.meetingLink && (
                                    <a
                                        href={interview.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Join Meeting
                                    </a>
                                )}

                                {interview.location && (
                                    <p>{interview.location}</p>
                                )}
                            </div>

                            {interview.notes && (
                                <p className="interview-notes">
                                    {interview.notes}
                                </p>
                            )}

                            {interview.status === "Scheduled" && (
                                <div className="manage-job-actions">
                                    <button
                                        type="button"
                                        className="edit-job-btn"
                                        onClick={() =>
                                            openRescheduleForm(interview)
                                        }
                                    >
                                        Reschedule
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-job-btn"
                                        onClick={() =>
                                            handleCancel(interview._id)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="save-edit-btn"
                                        onClick={() =>
                                            handleComplete(interview._id)
                                        }
                                    >
                                        Complete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Interviews;
