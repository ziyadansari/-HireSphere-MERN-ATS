import { Link } from "react-router-dom";
import { MapPin, BriefcaseBusiness, Bookmark } from "lucide-react";

function JobCard({ job, onSave, saved = false }) {
    const companyName = job.company?.name || "Company";
    const salary = job.salary?.min || job.salary?.max
        ? `₹${job.salary?.min?.toLocaleString("en-IN") || "—"} - ₹${job.salary?.max?.toLocaleString("en-IN") || "—"}`
        : "Salary not disclosed";

    return (
        <article className="job-card">
            <div className="job-card-top">
                <div className="company-logo">
                    {companyName.charAt(0).toUpperCase()}
                </div>

                <button
                    className={`save-button ${saved ? "saved" : ""}`}
                    onClick={() => onSave(job._id)}
                    title={saved ? "Remove saved job" : "Save job"}
                    type="button"
                >
                    <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
                </button>
            </div>

            <h3>{job.title}</h3>
            <p className="company-name">{companyName}</p>

            <div className="job-meta">
                <span><MapPin size={15} /> {job.location || "Location not specified"}</span>
                <span><BriefcaseBusiness size={15} /> {job.jobType || "Not specified"}</span>
            </div>

            <p className="job-salary">{salary}</p>

            <div className="job-skills">
                {(job.skills || []).slice(0, 4).map((skill, index) => (
                    <span key={`${skill}-${index}`}>{skill}</span>
                ))}
            </div>

            <Link to={`/jobs/${job._id}`} className="primary-button job-view-button">
                View Details
            </Link>
        </article>
    );
}

export default JobCard;