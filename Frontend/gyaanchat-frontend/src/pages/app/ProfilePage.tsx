import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../api/client";

export default function ProfilePage() {
    const { user, tenant, updateUser } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [saving, setSaving] = useState(false);

    const [showPw, setShowPw] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwSaving, setPwSaving] = useState(false);

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    useEffect(() => {
        api.get("/auth/me").then((res) => {
            setName(res.data.name || "");
            setEmail(res.data.email || "");
        }).catch(() => { });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch("/auth/profile", { name, email });
            updateUser({ name: data.name, email: data.email });
            showToast("Profile updated!", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Failed to update profile.", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        if (newPw !== confirmPw) { showToast("Passwords don't match.", "error"); return; }
        if (newPw.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
        setPwSaving(true);
        try {
            await api.patch("/auth/profile", { current_password: currentPw, new_password: newPw });
            showToast("Password changed!", "success");
            setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowPw(false);
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Failed to change password.", "error");
        } finally {
            setPwSaving(false);
        }
    }

    return (
        <div className="page" style={{ maxWidth: 680 }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your personal information</p>
                </div>
            </div>

            {/* Avatar + Name */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="profile-avatar-section">
                    <div className="profile-avatar">{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{name || "User"}</div>
                        <div className="muted">{email}</div>
                        {tenant && <div className="muted" style={{ marginTop: 2 }}>Org: {tenant.name}</div>}
                    </div>
                </div>

                <hr className="divider" />

                <form onSubmit={handleSave}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Personal Information</h2>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <button className="btn-primary" type="submit" disabled={saving}>
                        {saving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving...</> : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Password Change */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setShowPw((v) => !v)}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Change Password</h2>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showPw ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
                {showPw && (
                    <form onSubmit={handlePasswordChange} style={{ marginTop: 16 }}>
                        <div className="form-group">
                            <label className="label">Current Password</label>
                            <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" />
                        </div>
                        <div className="form-group">
                            <label className="label">New Password</label>
                            <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 6 characters" />
                        </div>
                        <div className="form-group">
                            <label className="label">Confirm New Password</label>
                            <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                        </div>
                        <button className="btn-primary" type="submit" disabled={pwSaving}>
                            {pwSaving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Updating...</> : "Update Password"}
                        </button>
                    </form>
                )}
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
                <div className="danger-zone-title">⚠ Danger Zone</div>
                <div className="danger-zone-desc">Permanently delete your account and all associated data. This cannot be undone.</div>
                <button className="btn-danger" onClick={() => showToast("Account deletion is not available in this version.", "info")}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}

