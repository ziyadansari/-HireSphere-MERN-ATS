
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await API.post("/auth/forgot-password", { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Forgot password?</h1>
                <p className="auth-subtitle">
                    Enter your registered email to receive a reset link.
                </p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                    />

                    <button className="primary-btn" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link to="/login">Back to login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
