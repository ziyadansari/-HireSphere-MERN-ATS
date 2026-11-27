
import { useLocation } from "react-router-dom";
import {
    Building2,
    BriefcaseBusiness,
    Users,
    CalendarDays
} from "lucide-react";

import "../styles/Candidate.css";

const pageDetails = {
    "/recruiter/company": {
        title: "Company Profile",
        description: "Manage your company information.",
        icon: Building2
    },
    "/recruiter/jobs": {
        title: "Manage Jobs",
        description: "Create, update and manage your job postings.",
        icon: BriefcaseBusiness
    },
    "/recruiter/jobs/create": {
        title: "Post a Job",
        description: "Create a new job opportunity for candidates.",
        icon: BriefcaseBusiness
    },
    "/recruiter/applicants": {
        title: "Applicants",
        description: "View and manage candidates who applied for your jobs.",
        icon: Users
    },
    "/recruiter/interviews": {
        title: "Interviews",
        description: "Manage your scheduled candidate interviews.",
        icon: CalendarDays
    }
};

function RecruiterPage() {
    const location = useLocation();
    const page = pageDetails[location.pathname];

    if (!page) {
        return <div className="page-message">Page not found.</div>;
    }

    const PageIcon = page.icon;

    return (
        <main className="candidate-container">
            <section className="jobs-heading">
                <p className="eyebrow">RECRUITER PANEL</p>

                <h1>{page.title}</h1>

                <p>{page.description}</p>
            </section>

            <section className="profile-section">
                <PageIcon size={35} />
                <h2>{page.title}</h2>
                <p>
                    This module will be developed in the next step.
                </p>
            </section>
        </main>
    );
}

export default RecruiterPage;
