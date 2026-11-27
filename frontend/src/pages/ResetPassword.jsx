
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";

const ResetPassword = () => {
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const response = await API.put(
                `/auth/reset-password/${token}`,
                { password }
            );
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Reset password</h1>
                <p className="auth-subtitle">Create your new password.</p>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <label>New password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            minLength={8}
                            required
                        />

                        <button className="primary-btn" disabled={loading}>
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/login">Go to login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
