
import { useEffect, useState } from "react";
import {
    Search,
    Eye,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    X,
    RefreshCw
} from "lucide-react";

import api from "../api/axios";
import "../styles/AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [page, setPage] = useState(1);

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin/users", {
                params: {
                    search,
                    role,
                    page,
                    limit: 10
                }
            });

            setUsers(response.data.users || []);
            setTotalUsers(response.data.totalUsers || 0);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, role, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleRoleChange = (value) => {
        setRole(value);
        setPage(1);
    };

    const handleViewUser = async (id) => {
        try {
            setDetailsLoading(true);
            setSelectedUser(null);

            const response = await api.get(`/admin/users/${id}`);

            setSelectedUser(response.data.user);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to load user details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStatusChange = async (user) => {
        const nextStatus = !user.isActive;

        const confirmed = window.confirm(
            `Are you sure you want to ${
                nextStatus ? "activate" : "deactivate"
            } ${user.name}'s account?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(user._id);

            await api.patch(`/admin/users/${user._id}/status`, {
                isActive: nextStatus
            });

            await fetchUsers();

            if (selectedUser?._id === user._id) {
                setSelectedUser((previous) => ({
                    ...previous,
                    isActive: nextStatus
                }));
            }
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update user status."
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
        <div className="admin-users-page">

            {/* Header */}
            <div className="admin-users-header">
                <div>
                    <h1>Manage Users</h1>
                    <p>View, search and manage registered users.</p>
                </div>

                <button
                    className="users-refresh-btn"
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Search and Filter */}
            <div className="users-toolbar">

                <form
                    className="users-search-form"
                    onSubmit={handleSearch}
                >
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />

                    <button type="submit">Search</button>
                </form>

                <select
                    className="users-role-filter"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                </select>

            </div>

            {/* User Count */}
            <div className="users-total">
                Total Users: <strong>{totalUsers}</strong>
            </div>

            {/* Error */}
            {error && (
                <div className="users-error">
                    {error}
                    <button onClick={fetchUsers}>Try Again</button>
                </div>
            )}

            {/* Users Table */}
            <div className="users-table-card">
                <div className="users-table-wrapper">

                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Account Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="users-empty">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="users-empty">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="users-name">
                                            {user.name}
                                        </td>

                                        <td>{user.email}</td>

                                        <td>
                                            <span className={`user-role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>{formatDate(user.createdAt)}</td>

                                        <td>
                                            <span className={`user-status-badge ${
                                                user.isActive === false
                                                    ? "inactive"
                                                    : "active"
                                            }`}>
                                                {user.isActive === false
                                                    ? "Inactive"
                                                    : "Active"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="users-actions">

                                                <button
                                                    className="user-view-btn"
                                                    title="View user"
                                                    onClick={() => handleViewUser(user._id)}
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {user.role !== "admin" && (
                                                    <button
                                                        className={
                                                            user.isActive === false
                                                                ? "user-activate-btn"
                                                                : "user-deactivate-btn"
                                                        }
                                                        title={
                                                            user.isActive === false
                                                                ? "Activate user"
                                                                : "Deactivate user"
                                                        }
                                                        disabled={updatingId === user._id}
                                                        onClick={() => handleStatusChange(user)}
                                                    >
                                                        {user.isActive === false
                                                            ? <UserCheck size={16} />
                                                            : <UserX size={16} />}
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>

                {/* Pagination */}
                <div className="users-pagination">
                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <div>
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((previous) => previous - 1)}
                        >
                            <ChevronLeft size={17} />
                            Previous
                        </button>

                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((previous) => previous + 1)}
                        >
                            Next
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {(selectedUser || detailsLoading) && (
                <div
                    className="user-modal-overlay"
                    onClick={() => {
                        setSelectedUser(null);
                        setDetailsLoading(false);
                    }}
                >
                    <div
                        className="user-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="user-modal-header">
                            <h2>User Details</h2>

                            <button
                                onClick={() => {
                                    setSelectedUser(null);
                                    setDetailsLoading(false);
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <p className="users-empty">Loading details...</p>
                        ) : selectedUser && (
                            <div className="user-modal-content">

                                <div className="user-avatar">
                                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                                </div>

                                <h3>{selectedUser.name}</h3>
                                <p className="user-modal-email">
                                    {selectedUser.email}
                                </p>

                                <div className="user-modal-details">
                                    <div>
                                        <span>User ID</span>
                                        <strong>{selectedUser._id}</strong>
                                    </div>

                                    <div>
                                        <span>Role</span>
                                        <strong>{selectedUser.role}</strong>
                                    </div>

                                    <div>
                                        <span>Account Status</span>
                                        <strong>
                                            {selectedUser.isActive === false
                                                ? "Inactive"
                                                : "Active"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Registered On</span>
                                        <strong>
                                            {formatDate(selectedUser.createdAt)}
                                        </strong>
                                    </div>
                                </div>

                                {selectedUser.role !== "admin" && (
                                    <button
                                        className={
                                            selectedUser.isActive === false
                                                ? "modal-activate-btn"
                                                : "modal-deactivate-btn"
                                        }
                                        disabled={updatingId === selectedUser._id}
                                        onClick={() => handleStatusChange(selectedUser)}
                                    >
                                        {selectedUser.isActive === false
                                            ? "Activate Account"
                                            : "Deactivate Account"}
                                    </button>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminUsers;
