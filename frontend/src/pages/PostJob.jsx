
import { useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    Building2,
    MapPin,
    CalendarDays,
    IndianRupee,
    Plus
} from "lucide-react";

import API from "../api/axios";
import "../styles/Candidate.css";

function PostJob() {
    const [companies, setCompanies] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        location: "",
        jobType: "Full-time",
        salaryMin: "",
        salaryMax: "",
        company: "",
        applicationDeadline: ""
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch recruiter-owned companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await API.get("/companies/my-companies");

                const approvedCompanies = (
                    response.data.companies || []
                ).filter(company => company.isApproved);

                setCompanies(approvedCompanies);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your companies."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Handle inputs
    const handleChange = (e) => {
        setForm(previous => ({
            ...previous,
            [e.target.name]: e.target.value
        }));
    };

    // Create job
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!form.company) {
            setError("Please select an approved company.");
            return;
        }

        if (
            form.salaryMin !== "" &&
            form.salaryMax !== "" &&
            Number(form.salaryMin) > Number(form.salaryMax)
        ) {
            setError("Maximum salary must be greater than minimum salary.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            requirements: form.requirements
                .split("\n")
                .map(item => item.trim())
                .filter(Boolean),
            skills: form.skills
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),
            location: form.location.trim(),
            jobType: form.jobType,
            salary: {
                min: Number(form.salaryMin) || 0,
                max: Number(form.salaryMax) || 0
            },
            company: form.company,
            applicationDeadline: form.applicationDeadline || undefined
        };

        setSubmitting(true);

        try {
            const response = await API.post("/jobs", payload);

            setMessage(
                response.data.message ||
                "Job created successfully!"
            );

            setForm({
                title: "",
                description: "",
                requirements: "",
                skills: "",
                location: "",
                jobType: "Full-time",
                salaryMin: "",
                salaryMax: "",
                company: "",
                applicationDeadline: ""
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create job."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-message">
                Loading company information...
            </div>
        );
    }

    return (
        <main className="candidate-container post-job-page">

            <section className="jobs-heading">
                <p className="eyebrow">RECRUITER PANEL</p>
                <h1>Post a New Job</h1>
                <p>
                    Find the right candidates for your company.
                </p>
            </section>

            {message && (
                <div className="success-message">{message}</div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            {companies.length === 0 ? (
                <section className="profile-section company-warning">
                    <Building2 size={35} />

                    <h2>No Approved Company Available</h2>

                    <p>
                        You need an admin-approved company before
                        you can publish a job.
                    </p>

                    <p>
                        Visit Company Profile to check your approval status.
                    </p>
                </section>
            ) : (
                <section className="profile-section">

                    <div className="profile-section-heading">
                        <BriefcaseBusiness size={23} />
                        <div>
                            <h2>Job Information</h2>
                            <p>Enter the details of your job opening.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="profile-field">
                            <label htmlFor="title">Job Title *</label>
                            <input
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Example: MERN Stack Developer"
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="company">
                                <Building2 size={15} /> Select Company *
                            </label>

                            <select
                                id="company"
                                name="company"
                                value={form.company}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select your company</option>

                                {companies.map(company => (
                                    <option
                                        key={company._id}
                                        value={company._id}
                                    >
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="description">
                                Job Description *
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                rows="5"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the job responsibilities..."
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="requirements">
                                Requirements
                            </label>

                            <textarea
                                id="requirements"
                                name="requirements"
                                rows="4"
                                value={form.requirements}
                                onChange={handleChange}
                                placeholder={"Bachelor's degree\nGood communication skills\nRelevant experience"}
                            />

                            <small>Enter each requirement on a new line.</small>
                        </div>

                        <div className="profile-field">
                            <label htmlFor="skills">Required Skills</label>

                            <input
                                id="skills"
                                name="skills"
                                value={form.skills}
                                onChange={handleChange}
                                placeholder="React, JavaScript, Node.js, MongoDB"
                            />

                            <small>Separate skills using commas.</small>
                        </div>

                        <div className="profile-form-grid">

                            <div className="profile-field">
                                <label htmlFor="location">
                                    <MapPin size={15} /> Job Location *
                                </label>

                                <input
                                    id="location"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="Example: Noida, India"
                                    required
                                />
                            </div>

                            <div className="profile-field">
                                <label htmlFor="jobType">Job Type *</label>

                                <select
                                    id="jobType"
                                    name="jobType"
                                    value={form.jobType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>

                            <div className="profile-field">
                                <label htmlFor="salaryMin">
                                    <IndianRupee size={15} /> Minimum Salary (₹)
                                </label>

                                <input
                                    id="salaryMin"
                                    name="salaryMin"
                                    type="number"
                                    min="0"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                    placeholder="300000"
                                />
                            </div>

                            <div className="profile-field">
                                <label htmlFor="salaryMax">
                                    <IndianRupee size={15} /> Maximum Salary (₹)
                                </label>

                                <input
                                    id="salaryMax"
                                    name="salaryMax"
                                    type="number"
                                    min="0"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                    placeholder="600000"
                                />
                            </div>

                            <div className="profile-field">
                                <label htmlFor="applicationDeadline">
                                    <CalendarDays size={15} /> Application Deadline
                                </label>

                                <input
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    type="date"
                                    min={new Date().toLocaleDateString("en-CA")}
                                    value={form.applicationDeadline}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={submitting}
                        >
                            <Plus size={18} />
                            {submitting ? "Posting Job..." : "Post Job"}
                        </button>

                    </form>
                </section>
            )}

        </main>
    );
}

export default PostJob;
