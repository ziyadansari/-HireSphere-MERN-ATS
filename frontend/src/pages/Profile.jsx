
import { useEffect, useState } from "react";
import {
    UserRound,
    Phone,
    MapPin,
    FileText,
    Upload,
    Download,
    Save
} from "lucide-react";

import api from "../api/axios";
import "../styles/Candidate.css";

function Profile() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        headline: "",
        location: "",
        bio: "",
        skills: ""
    });

    const [profileData, setProfileData] = useState(null);
    const [resume, setResume] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Fetch candidate profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/users/profile");
                const user = response.data.user;

                setProfileData(user);

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    headline: user.headline || "",
                    location: user.location || "",
                    bio: user.bio || "",
                    skills: (user.skills || []).join(", ")
                });

                setResume(user.resume || null);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle form inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // Update candidate profile
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                headline: formData.headline.trim(),
                location: formData.location.trim(),
                bio: formData.bio.trim(),
                skills: formData.skills
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean),

                education: profileData?.education || [],
                experience: profileData?.experience || [],
                projects: profileData?.projects || [],
                certifications: profileData?.certifications || []
            };

            const response = await api.put("/users/profile", payload);
            const updatedUser = response.data.user;

            setProfileData(updatedUser);

            setMessage(
                response.data.message || "Profile updated successfully!"
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // Select and validate resume
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setError("");
        setMessage("");

        if (!file) {
            setResumeFile(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setError("Please select a PDF file.");
            setResumeFile(null);
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Resume must be smaller than 5 MB.");
            setResumeFile(null);
            event.target.value = "";
            return;
        }

        setResumeFile(file);
        setMessage(`Selected successfully: ${file.name}`);
    };

    // Upload resume
    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setError("Please select a PDF resume first.");
            return;
        }

        const uploadData = new FormData();
        uploadData.append("resume", resumeFile);

        setUploading(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post(
                "/users/resume",
                uploadData
            );

            setResume(response.data.resume);
            setResumeFile(null);

            setMessage("Resume uploaded successfully!");

            const input = document.getElementById("resumeFile");
            if (input) input.value = "";

        } catch (err) {
            console.error(
                "Resume upload error:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                "Resume upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    // Download resume
    const handleResumeDownload = async () => {
        setError("");

        try {
            const response = await api.get("/users/resume", {
                responseType: "blob"
            });

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: "application/pdf"
                })
            );

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = resume || "my-resume.pdf";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            setError(
                "Unable to download resume. Please check whether a resume has been uploaded."
            );
        }
    };

    if (loading) {
        return (
            <div className="page-message">
                Loading profile...
            </div>
        );
    }

    return (
        <main className="candidate-container profile-page">

            <section className="jobs-heading">
                <p className="eyebrow">YOUR PROFESSIONAL IDENTITY</p>
                <h1>My Profile</h1>
                <p>Manage your personal and professional information.</p>
            </section>

            {message && (
                <div className="success-message">{message}</div>
            )}

            {error && (
                <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">

                <section className="profile-section">
                    <div className="profile-section-heading">
                        <UserRound size={21} />
                        <div>
                            <h2>Personal Information</h2>
                            <p>Your basic account details.</p>
                        </div>
                    </div>

                    <div className="profile-form-grid">

                        <div className="profile-field">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                value={formData.email}
                                readOnly
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="phone">
                                <Phone size={15} /> Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="location">
                                <MapPin size={15} /> Location
                            </label>
                            <input
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="City, Country"
                            />
                        </div>

                    </div>
                </section>

                <section className="profile-section">
                    <div className="profile-section-heading">
                        <FileText size={21} />
                        <div>
                            <h2>Professional Information</h2>
                            <p>Tell employers about your professional background.</p>
                        </div>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="headline">Professional Headline</label>
                        <input
                            id="headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            placeholder="Example: MERN Stack Developer"
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="bio">About Me</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows="5"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Write a short professional introduction..."
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="skills">Skills</label>
                        <input
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="React, JavaScript, Node.js, MongoDB"
                        />
                        <small>Separate each skill with a comma.</small>
                    </div>
                </section>

                <div className="profile-save-row">
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>

            </form>

            <section className="profile-section resume-section">
                <div className="profile-section-heading">
                    <FileText size={21} />
                    <div>
                        <h2>Resume</h2>
                        <p>
                            Upload your latest resume in PDF format.
                            Maximum size 5 MB.
                        </p>
                    </div>
                </div>

                {resume && (
                    <div className="uploaded-resume">
                        <FileText size={22} />
                        <div>
                            <strong>Resume uploaded</strong>
                            <small>{resume}</small>
                        </div>

                        <button
                            type="button"
                            className="download-button"
                            onClick={handleResumeDownload}
                        >
                            <Download size={17} />
                            Download
                        </button>
                    </div>
                )}

                <div className="resume-upload-area">
                    <input
                        id="resumeFile"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                    />

                    {resumeFile && (
                        <p className="selected-file">
                            Selected: {resumeFile.name}
                        </p>
                    )}

                    <button
                        type="button"
                        className="primary-button"
                        onClick={handleResumeUpload}
                        disabled={!resumeFile || uploading}
                    >
                        <Upload size={17} />
                        {uploading ? "Uploading..." : "Upload Resume"}
                    </button>
                </div>
            </section>

        </main>
    );
}

export default Profile;
