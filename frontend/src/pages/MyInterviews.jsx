
import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    MapPin,
    Video,
    User,
    BriefcaseBusiness,
    RefreshCw
} from "lucide-react";

import api from "../api/axios";
import "../styles/MyInterviews.css";

function MyInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/interviews/my-interviews");

            setInterviews(response.data.interviews || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="my-interviews-page">
                <p className="interview-message">Loading interviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-interviews-page">
                <p className="interview-error">{error}</p>

                <button
                    className="interview-retry-button"
                    onClick={fetchInterviews}
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="my-interviews-page">

            <div className="my-interviews-header">
                <div>
                    <h1>My Interviews</h1>
                    <p>View and manage your scheduled interviews.</p>
                </div>

                <button
                    className="interview-refresh-button"
                    onClick={fetchInterviews}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="interview-count">
                Total Interviews: <strong>{interviews.length}</strong>
            </div>

            {interviews.length === 0 ? (
                <div className="no-interviews">
                    <CalendarDays size={45} />
                    <h2>No Interviews Yet</h2>
                    <p>
                        Your scheduled interviews will appear here.
                    </p>
                </div>
            ) : (
                <div className="interviews-list">

                    {interviews.map((interview) => (
                        <div className="candidate-interview-card" key={interview._id}>

                            <div className="candidate-interview-top">
                                <div className="interview-job-icon">
                                    <BriefcaseBusiness size={23} />
                                </div>

                                <div className="interview-job-info">
                                    <h2>
                                        {interview.job?.title || "Job Title"}
                                    </h2>

                                    <p>
                                        {interview.job?.location || "Location not specified"}
                                    </p>
                                </div>

                                <span
                                    className={`interview-status status-${interview.status?.toLowerCase()}`}
                                >
                                    {interview.status}
                                </span>
                            </div>

                            <div className="interview-details-grid">

                                <div className="interview-detail">
                                    <CalendarDays size={18} />
                                    <div>
                                        <span>Date</span>
                                        <strong>
                                            {formatDate(interview.scheduledAt)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="interview-detail">
                                    <Clock size={18} />
                                    <div>
                                        <span>Time</span>
                                        <strong>
                                            {formatTime(interview.scheduledAt)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="interview-detail">
                                    <Clock size={18} />
                                    <div>
                                        <span>Duration</span>
                                        <strong>
                                            {interview.duration} minutes
                                        </strong>
                                    </div>
                                </div>

                                <div className="interview-detail">
                                    <Video size={18} />
                                    <div>
                                        <span>Interview Type</span>
                                        <strong>
                                            {interview.interviewType}
                                        </strong>
                                    </div>
                                </div>

                                <div className="interview-detail">
                                    <User size={18} />
                                    <div>
                                        <span>Recruiter</span>
                                        <strong>
                                            {interview.recruiter?.name || "Not available"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="interview-detail">
                                    <BriefcaseBusiness size={18} />
                                    <div>
                                        <span>Round</span>
                                        <strong>
                                            Round {interview.round}
                                        </strong>
                                    </div>
                                </div>

                                {interview.location && (
                                    <div className="interview-detail">
                                        <MapPin size={18} />
                                        <div>
                                            <span>Interview Location</span>
                                            <strong>{interview.location}</strong>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {interview.meetingLink && (
                                <div className="interview-meeting-link">
                                    <a
                                        href={interview.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Video size={17} />
                                        Join Interview
                                    </a>
                                </div>
                            )}

                            {interview.notes && (
                                <div className="interview-notes">
                                    <strong>Recruiter Notes</strong>
                                    <p>{interview.notes}</p>
                                </div>
                            )}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default MyInterviews;
