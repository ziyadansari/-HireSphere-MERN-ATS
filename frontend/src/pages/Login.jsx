
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await login(form);

            const role = response.user?.role?.toLowerCase();

            if (role === "candidate") {
                navigate("/dashboard", { replace: true });
            } else if (role === "recruiter") {
                navigate("/recruiter-dashboard", { replace: true });
            } else if (role === "admin") {
                navigate("/admin-dashboard", { replace: true });
            } else {
                setError("Invalid user role. Please contact support.");
            }
            console.log("Login response:", response);

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed"
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <BriefcaseBusiness size={34} />
                </div>

                <h1>Welcome back</h1>
                <p className="auth-subtitle">
                    Sign in to continue to HireSphere
                </p>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <label>Email address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    </div>

                    <div className="forgot-link">
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        className="primary-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
