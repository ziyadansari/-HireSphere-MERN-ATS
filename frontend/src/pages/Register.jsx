
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "candidate"
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            await register(form);
            navigate("/dashboard");
        } catch (error) {
    console.log("Registration Error:", error.response?.data);

    setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
    );
}
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <BriefcaseBusiness size={34} />
                </div>

                <h1>Create your account</h1>
                <p className="auth-subtitle">
                    Join HireSphere and start your journey
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Full name</label>
                    <input
                        name="name"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

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
                    <input
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                    />

                    <label>Register as</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="candidate">Job Candidate</option>
                        <option value="recruiter">Recruiter</option>
                    </select>

                    <button className="primary-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
