
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Candidate pages
import CandidateDashboard from "./pages/CandidateDashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import MyInterviews from "./pages/MyInterviews";
import Profile from "./pages/Profile";

// Recruiter pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterPage from "./pages/RecruiterPage";
import CompanyProfile from "./pages/CompanyProfile";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import Applicants from "./pages/Applicants";
import Interviews from "./pages/Interviews";

// admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCompanies from "./pages/AdminCompanies";
import AdminJobs from "./pages/AdminJobs";



// Redirect according to user role
function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="page-message">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.role?.toLowerCase();

    if (role === "candidate") {
        return <Navigate to="/dashboard" replace />;
    }

    if (role === "recruiter") {
        return <Navigate to="/recruiter-dashboard" replace />;
    }

    if (role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
}

function AppContent() {
    return (
        <>
            <Navbar />

            <Routes>
                {/* Home */}
                <Route path="/" element={<HomeRedirect />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Candidate routes */}
                <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
                    <Route path="/dashboard" element={<CandidateDashboard />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/saved-jobs" element={<SavedJobs />} />
                    <Route path="/my-applications" element={<MyApplications />} />
                    <Route path="/my-interviews" element={<MyInterviews />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
                {/* admin */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
    />
    
</Route>
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
    <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
    />

    <Route
        path="/admin/users"
        element={<AdminUsers />}
    />
<Route
    path="/admin/companies"
    element={<AdminCompanies />}
/>
<Route
    path="/admin/jobs"
    element={<AdminJobs />}
/>

</Route>







                {/* Recruiter routes */}
                      <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
                     
    <Route
        path="/recruiter-dashboard"
        element={<RecruiterDashboard />}
    />

     <Route
    path="/recruiter/company"
    element={<CompanyProfile />}
/>
    <Route path="/recruiter/jobs" element={<ManageJobs />} />
 
    <Route
    path="/recruiter/jobs/create"
    element={<PostJob />}
/>
   <Route
    path="/recruiter/applicants"
    element={<Applicants />}
/>
    <Route
    path="/recruiter/interviews"
    element={<Interviews />}
/>
</Route>

                {/* Unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
