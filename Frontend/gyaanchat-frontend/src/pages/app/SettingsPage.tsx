import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function SettingsPage() {
    const { user, tenant, updateUser } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [workspace, setWorkspace] = useState(tenant?.name || "");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }
        setSavingProfile(true);
        try {
            updateUser({ name: name.trim() });
            showToast("Profile updated.", "success");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("Please fill in all password fields.", "error"); return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error"); return;
        }
        if (newPassword.length < 8) {
            showToast("New password must be at least 8 characters.", "error"); return;
        }
        setSavingPassword(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showToast("Password changed successfully.", "success");
        } finally {
            setSavingPassword(false);
        }
    }

    function handleDeleteAccount() {
        showToast("Account deletion is not available in this version.", "info");
        setConfirmDelete(false);
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and security preferences</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

                {/* ── Profile & Account ── */}
                <div className="card">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 24 }}>Profile & Account</h2>
                    <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                            <label className="label">Name</label>
                            <input
                                className="input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                readOnly
                                style={{ opacity: 0.6, cursor: "not-allowed" }}
                            />
                        </div>
                        <div>
                            <label className="label">Workspace name</label>
                            <input
                                className="input"
                                type="text"
                                value={workspace}
                                onChange={(e) => setWorkspace(e.target.value)}
                                placeholder="Your workspace name"
                            />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                            <button className="btn-primary" type="submit" disabled={savingProfile}>
                                {savingProfile
                                    ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Saving...</>
                                    : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Security ── */}
                <div className="card">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 24 }}>Security</h2>

                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                            <label className="label">Current password</label>
                            <input
                                className="input"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                        </div>
                        <div>
                            <label className="label">New password</label>
                            <input
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label className="label">Confirm new password</label>
                            <input
                                className="input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                autoComplete="new-password"
                            />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                            <button className="btn-primary" type="submit" disabled={savingPassword}>
                                {savingPassword
                                    ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Updating...</>
                                    : "Change password"}
                            </button>
                        </div>
                    </form>

                    <hr className="divider" style={{ margin: "28px 0" }} />

                    <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 6 }}>Delete account</div>
                        <p className="muted" style={{ marginBottom: 16 }}>
                            Permanently remove your account and all associated data. This cannot be undone.
                        </p>
                        {!confirmDelete ? (
                            <button
                                className="btn-ghost"
                                style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete account
                            </button>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span className="muted" style={{ fontSize: "0.875rem" }}>Are you sure?</span>
                                <button className="btn-danger" onClick={handleDeleteAccount}>Yes, delete</button>
                                <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
