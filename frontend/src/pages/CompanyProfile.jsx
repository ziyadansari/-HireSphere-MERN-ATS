
import { useEffect, useState } from "react";
import {
    Building2,
    Globe,
    MapPin,
    BriefcaseBusiness,
    Plus,
    RefreshCw
} from "lucide-react";

import API from "../api/axios";
import "../styles/Candidate.css";

function CompanyProfile() {
    const [companies, setCompanies] = useState([]);

    const [form, setForm] = useState({
        name: "",
        industry: "",
        location: "",
        website: "",
        description: "",
        logo: ""
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch recruiter's companies
    const fetchCompanies = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get("/companies/my-companies");
            setCompanies(response.data.companies || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load company information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // Handle form inputs
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Create company
    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                name: form.name.trim(),
                industry: form.industry.trim(),
                location: form.location.trim(),
                website: form.website.trim(),
                description: form.description.trim(),
                logo: form.logo.trim()
            };

            const response = await API.post("/companies", payload);

            setMessage(
                response.data.message ||
                "Company created successfully!"
            );

            setForm({
                name: "",
                industry: "",
                location: "",
                website: "",
                description: "",
                logo: ""
            });

            await fetchCompanies();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create company."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="candidate-container">

            <section className="jobs-heading">
                <p className="eyebrow">RECRUITER PANEL</p>
                <h1>Company Profile</h1>
                <p>
                    Register your company and manage its approval status.
                </p>
            </section>

            {message && (
                <div className="success-message">{message}</div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            {/* Company creation form */}
            <section className="profile-section">
                <div className="profile-section-heading">
                    <Building2 size={23} />
                    <div>
                        <h2>Register Your Company</h2>
                        <p>Enter your company information below.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="profile-form-grid">

                        <div className="profile-field">
                            <label htmlFor="companyName">
                                Company Name *
                            </label>
                            <input
                                id="companyName"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter company name"
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="industry">
                                Industry
                            </label>
                            <input
                                id="industry"
                                name="industry"
                                value={form.industry}
                                onChange={handleChange}
                                placeholder="Example: Information Technology"
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="location">
                                <MapPin size={15} /> Location *
                            </label>
                            <input
                                id="location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="website">
                                <Globe size={15} /> Website
                            </label>
                            <input
                                id="website"
                                name="website"
                                type="url"
                                value={form.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="logo">
                                Company Logo URL
                            </label>
                            <input
                                id="logo"
                                name="logo"
                                value={form.logo}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                    </div>

                    <div className="profile-field">
                        <label htmlFor="description">
                            Company Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="5"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Tell us about your company..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={submitting}
                    >
                        <Plus size={18} />
                        {submitting
                            ? "Registering..."
                            : "Register Company"}
                    </button>

                </form>
            </section>

            {/* Registered companies */}
            <section className="profile-section company-list-section">

                <div className="profile-section-heading">
                    <BriefcaseBusiness size={23} />

                    <div>
                        <h2>My Companies</h2>
                        <p>Companies registered by your account.</p>
                    </div>

                    <button
                        type="button"
                        className="download-button"
                        onClick={fetchCompanies}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p>Loading companies...</p>
                ) : companies.length === 0 ? (
                    <div className="company-empty">
                        <Building2 size={35} />
                        <h3>No companies registered yet</h3>
                        <p>Register your first company using the form above.</p>
                    </div>
                ) : (
                    <div className="company-list">

                        {companies.map((company) => (
                            <div
                                className="company-card"
                                key={company._id}
                            >
                                <div className="company-card-top">
                                    <div className="company-icon">
                                        <Building2 size={25} />
                                    </div>

                                    <span
                                        className={
                                            company.isApproved
                                                ? "company-status approved"
                                                : "company-status pending"
                                        }
                                    >
                                        {company.isApproved
                                            ? "Approved"
                                            : "Pending Approval"}
                                    </span>
                                </div>

                                <h3>{company.name}</h3>

                                <p>{company.industry || "Industry not specified"}</p>

                                <div className="company-info">
                                    <span>
                                        <MapPin size={15} />
                                        {company.location}
                                    </span>

                                    {company.website && (
                                        <span>
                                            <Globe size={15} />
                                            {company.website}
                                        </span>
                                    )}
                                </div>

                                {company.description && (
                                    <p className="company-description">
                                        {company.description}
                                    </p>
                                )}
                            </div>
                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}

export default CompanyProfile;
