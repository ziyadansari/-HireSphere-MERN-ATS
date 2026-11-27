
import { useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    Globe,
    User,
    Mail,
    CheckCircle,
    Clock,
    Eye,
    RefreshCw,
    X
} from "lucide-react";

import api from "../api/axios";
import "../styles/AdminCompanies.css";

function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/companies/pending");

            setCompanies(response.data.companies || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load pending companies."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleApprove = async (company) => {
        const confirmed = window.confirm(
            `Are you sure you want to approve ${company.name}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(company._id);

            await api.patch(`/companies/${company._id}/approve`);

            setCompanies((previous) =>
                previous.filter((item) => item._id !== company._id)
            );

            setSelectedCompany(null);

            alert("Company approved successfully!");
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to approve company."
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

    return (
        <div className="admin-companies-page">

            {/* Header */}
            <div className="admin-companies-header">
                <div>
                    <h1>Manage Companies</h1>
                    <p>Review and approve recruiter company registrations.</p>
                </div>

                <button
                    className="companies-refresh-btn"
                    onClick={fetchCompanies}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="companies-summary">
                <div className="companies-summary-icon">
                    <Building2 size={25} />
                </div>

                <div>
                    <p>Pending Companies</p>
                    <h2>{companies.length}</h2>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="companies-error">
                    {error}
                    <button onClick={fetchCompanies}>Try Again</button>
                </div>
            )}

            {/* Company List */}
            <div className="companies-list">

                {loading ? (
                    <div className="companies-empty">
                        Loading companies...
                    </div>
                ) : companies.length === 0 ? (
                    <div className="companies-empty">
                        <CheckCircle size={45} />
                        <h2>All Caught Up!</h2>
                        <p>There are no pending companies for approval.</p>
                    </div>
                ) : (
                    companies.map((company) => (
                        <div className="admin-company-card" key={company._id}>

                            <div className="company-card-top">

                                <div className="company-card-icon">
                                    {company.logo ? (
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                        />
                                    ) : (
                                        <Building2 size={25} />
                                    )}
                                </div>

                                <div className="company-card-info">
                                    <h2>{company.name}</h2>

                                    <p>
                                        <MapPin size={14} />
                                        {company.location}
                                    </p>
                                </div>

                                <span className="company-pending-badge">
                                    <Clock size={13} />
                                    Pending
                                </span>

                            </div>

                            <div className="company-card-description">
                                {company.description ||
                                    "No company description provided."}
                            </div>

                            <div className="company-card-meta">
                                <span>
                                    <User size={15} />
                                    {company.owner?.name || "Unknown Owner"}
                                </span>

                                <span>
                                    <Mail size={15} />
                                    {company.owner?.email || "N/A"}
                                </span>

                                {company.industry && (
                                    <span>
                                        Industry: {company.industry}
                                    </span>
                                )}
                            </div>

                            <div className="company-card-footer">

                                <span>
                                    Registered: {formatDate(company.createdAt)}
                                </span>

                                <div className="company-card-actions">

                                    <button
                                        className="company-view-btn"
                                        onClick={() => setSelectedCompany(company)}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>

                                    <button
                                        className="company-approve-btn"
                                        disabled={updatingId === company._id}
                                        onClick={() => handleApprove(company)}
                                    >
                                        <CheckCircle size={16} />
                                        {updatingId === company._id
                                            ? "Approving..."
                                            : "Approve"}
                                    </button>

                                </div>

                            </div>

                        </div>
                    ))
                )}

            </div>

            {/* Company Details Modal */}
            {selectedCompany && (
                <div
                    className="company-modal-overlay"
                    onClick={() => setSelectedCompany(null)}
                >
                    <div
                        className="company-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="company-modal-header">
                            <h2>Company Details</h2>

                            <button onClick={() => setSelectedCompany(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="company-modal-content">

                            <div className="company-modal-icon">
                                {selectedCompany.logo ? (
                                    <img
                                        src={selectedCompany.logo}
                                        alt={selectedCompany.name}
                                    />
                                ) : (
                                    <Building2 size={30} />
                                )}
                            </div>

                            <h3>{selectedCompany.name}</h3>

                            <p className="company-modal-description">
                                {selectedCompany.description ||
                                    "No description available."}
                            </p>

                            <div className="company-modal-details">

                                <div>
                                    <span>Location</span>
                                    <strong>{selectedCompany.location}</strong>
                                </div>

                                <div>
                                    <span>Industry</span>
                                    <strong>{selectedCompany.industry || "N/A"}</strong>
                                </div>

                                <div>
                                    <span>Website</span>
                                    <strong>
                                        {selectedCompany.website ? (
                                            <a
                                                href={selectedCompany.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Globe size={14} />
                                                Visit Website
                                            </a>
                                        ) : "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Owner</span>
                                    <strong>
                                        {selectedCompany.owner?.name || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Owner Email</span>
                                    <strong>
                                        {selectedCompany.owner?.email || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Registered On</span>
                                    <strong>
                                        {formatDate(selectedCompany.createdAt)}
                                    </strong>
                                </div>

                            </div>

                            <button
                                className="company-modal-approve"
                                disabled={updatingId === selectedCompany._id}
                                onClick={() => handleApprove(selectedCompany)}
                            >
                                <CheckCircle size={17} />
                                Approve Company
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminCompanies;
