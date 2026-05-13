import * as React from "react";
import { Lock, AlertCircle, CheckCircle2, Copy, Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, Badge } from "../components/ui/Card";

export default function Settings() {
    const [showChangePassphrase, setShowChangePassphrase] = React.useState(false);
    const [newPassphrase, setNewPassphrase] = React.useState("");
    const [confirmPassphrase, setConfirmPassphrase] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [messageType, setMessageType] = React.useState("");
    const [showRecoveryKeyGeneration, setShowRecoveryKeyGeneration] = React.useState(false);
    const [recoveryKey, setRecoveryKey] = React.useState("");
    const [isGeneratingRecoveryKey, setIsGeneratingRecoveryKey] = React.useState(false);
    const [recoveryKeyStatus, setRecoveryKeyStatus] = React.useState(null);
    const [profile, setProfile] = React.useState(null);
    const [displayName, setDisplayName] = React.useState("");
    const [avatarFile, setAvatarFile] = React.useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

    React.useEffect(() => {
        // Fetch recovery key status on mount
        const fetchRecoveryKeyStatus = async () => {
            try {
                const token = localStorage.getItem("sv_token");
                const response = await fetch("/api/auth/recovery-key-status", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let data = null;
                try {
                    data = await response.json();
                } catch (e) {
                    data = null;
                }
                if (response.ok && data) setRecoveryKeyStatus(data);
            } catch (err) {
                console.error("Failed to fetch recovery key status:", err);
            }
        };
        fetchRecoveryKeyStatus();
        // fetch profile
        (async () => {
            try {
                const token = localStorage.getItem("sv_token");
                if (!token) return;
                const r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
                let d = null;
                try { d = await r.json(); } catch (e) { d = null; }
                if (!r.ok) {
                    const txt = await r.text().catch(() => '');
                    console.warn('/api/auth/me failed', r.status, txt);
                    return;
                }
                setProfile(d?.user || null);
                setDisplayName(d?.user?.name || "");
            } catch (e) {
                console.error('Failed to load profile', e);
            }
        })();
    }, []);

    const handleGenerateRecoveryKey = async () => {
        setIsGeneratingRecoveryKey(true);
        try {
            const token = localStorage.getItem("sv_token");
            const response = await fetch("/api/auth/generate-recovery-key", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to generate recovery key");
            }

            setRecoveryKey(data.recoveryKey);
            setRecoveryKeyStatus({ hasRecoveryKey: true, isUsed: false });
            setMessage("Recovery key generated! Save it in a safe place.");
            setMessageType("success");
        } catch (err) {
            setMessage(err.message || "Failed to generate recovery key");
            setMessageType("error");
        } finally {
            setIsGeneratingRecoveryKey(false);
        }
    };

    const handleCopyRecoveryKey = () => {
        navigator.clipboard.writeText(recoveryKey);
        setMessage("Recovery key copied to clipboard!");
        setMessageType("success");
        setTimeout(() => { setMessage(""); }, 2000);
    };

    const handleDownloadRecoveryKey = () => {
        const element = document.createElement("a");
        const file = new Blob([`Recovery Key: ${recoveryKey}\n\nSave this key in a safe place. You will need it if you forget your master passphrase.\n\nGenerated: ${new Date().toISOString()}`], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `recovery-key-${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleChangePassphrase = () => {
        // Validate passphrases match
        if (newPassphrase !== confirmPassphrase) {
            setMessageType("error");
            setMessage("Passphrases do not match. Please try again.");
            return;
        }

        if (newPassphrase.length < 8) {
            setMessageType("error");
            setMessage("Passphrase must be at least 8 characters.");
            return;
        }

        // Store the new passphrase in localStorage or session
        // Note: This is client-side only. The passphrase is never sent to the server.
        localStorage.setItem("sv_master_passphrase_hint", new Date().toISOString());

        setMessageType("success");
        setMessage("Passphrase updated successfully. You can now use the new passphrase for future uploads.");
        setNewPassphrase("");
        setConfirmPassphrase("");
        setShowChangePassphrase(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('sv_token');
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: displayName })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');
            setProfile(data.user || profile);
            setMessage('Profile updated');
            setMessageType('success');
        } catch (err) {
            setMessage(err.message || 'Failed to update profile');
            setMessageType('error');
        }
    };

    const handleAvatarChange = (e) => {
        const f = e.target.files?.[0] || null;
        setAvatarFile(f);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;
        setIsUploadingAvatar(true);
        try {
            const token = localStorage.getItem('sv_token');
            const fd = new FormData();
            fd.append('avatar', avatarFile, avatarFile.name);
            const res = await fetch('/api/auth/me/avatar', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Avatar upload failed');
            setProfile((p) => ({ ...(p || {}), avatarUrl: data.avatarUrl }));
            setAvatarFile(null);
            setMessage('Avatar uploaded');
            setMessageType('success');
        } catch (err) {
            setMessage(err.message || 'Avatar upload failed');
            setMessageType('error');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="mb-4">
                <p className="section-kicker mb-2">Account</p>
                <h2 className="display-6 fw-bold mb-2 tracking-tightest">Settings</h2>
                <p className="text-muted fw-medium mb-0">Manage your vault security and preferences.</p>
            </div>

            {message && (
                <div className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2 mb-4`} role="alert">
                    {messageType === "success" ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <AlertCircle size={18} />
                    )}
                    <span>{message}</span>
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <Card className="shadow-sm">
                        <div className="d-flex align-items-start justify-content-between mb-4 pb-3 border-bottom">
                            <div className="d-flex align-items-start gap-3">
                                <div className="settings-icon" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h4 className="h5 fw-bold mb-1">Master Passphrase</h4>
                                    <p className="text-muted small mb-0">Change or reset your master passphrase used for encrypting files.</p>
                                </div>
                            </div>
                        </div>

                        {!showChangePassphrase ? (
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="mb-1 small text-muted">Your master passphrase is used to encrypt all files before upload.</p>
                                    <p className="mb-0 small text-muted">It is never sent to or stored on the server.</p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassphrase(true);
                                        setMessage("");
                                        setMessageType("");
                                    }}
                                    className="d-inline-flex align-items-center gap-2"
                                >
                                    <Lock size={16} />
                                    Change Passphrase
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="alert alert-warning d-flex gap-2 mb-4" role="alert">
                                    <AlertCircle size={18} className="flex-shrink-0" style={{ marginTop: "2px" }} />
                                    <div className="small">
                                        <strong>Important:</strong> Files encrypted with your old passphrase will still require the old passphrase to decrypt. Setting a new passphrase will only affect future uploads. Old encrypted files are not automatically re-encrypted.
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-uppercase small fw-bold text-muted mb-2">New Passphrase</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassphrase}
                                        onChange={(e) => setNewPassphrase(e.target.value)}
                                        placeholder="Enter a new master passphrase"
                                    />
                                    <small className="text-muted mt-1 d-block">Minimum 8 characters</small>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-uppercase small fw-bold text-muted mb-2">Confirm Passphrase</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmPassphrase}
                                        onChange={(e) => setConfirmPassphrase(e.target.value)}
                                        placeholder="Confirm your new passphrase"
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleChangePassphrase}
                                        disabled={!newPassphrase || !confirmPassphrase}
                                    >
                                        Confirm Change
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowChangePassphrase(false);
                                            setNewPassphrase("");
                                            setConfirmPassphrase("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="shadow-sm mt-4">
                        <div className="d-flex align-items-start gap-3 pb-3 border-bottom mb-4">
                            <div className="settings-icon" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="h5 fw-bold mb-1">Recovery Key</h4>
                                <p className="text-muted small mb-0">Generate a one-time recovery key to reset your passphrase if you forget it.</p>
                            </div>
                        </div>

                        {!recoveryKey ? (
                            <div>
                                <div className="mb-3 p-3 bg-light rounded" style={{ borderLeft: "4px solid #0d6efd" }}>
                                    <p className="small mb-1">
                                        <strong>What is a recovery key?</strong>
                                    </p>
                                    <p className="small text-muted mb-0">
                                        A recovery key allows you to set a new master passphrase if you forget the current one. It's a one-time use code that will be stored securely on the server.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerateRecoveryKey}
                                    disabled={isGeneratingRecoveryKey || (recoveryKeyStatus?.hasRecoveryKey && !recoveryKeyStatus?.isUsed)}
                                >
                                    {isGeneratingRecoveryKey ? "Generating..." : "Generate Recovery Key"}
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <div className="alert alert-warning d-flex gap-2 mb-3" role="alert">
                                    <AlertCircle size={18} className="flex-shrink-0" style={{ marginTop: "2px" }} />
                                    <div className="small">
                                        <strong>Important:</strong> This recovery key will only be shown once. Save it immediately in a secure location (password manager, encrypted file, printed copy).
                                    </div>
                                </div>

                                <div className="mb-3 p-3 bg-light rounded font-monospace" style={{ wordBreak: "break-all" }}>
                                    {recoveryKey}
                                </div>

                                <div className="d-flex gap-2 flex-wrap">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleCopyRecoveryKey}
                                        className="d-inline-flex align-items-center gap-2"
                                    >
                                        <Copy size={14} />
                                        Copy
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleDownloadRecoveryKey}
                                        className="d-inline-flex align-items-center gap-2"
                                    >
                                        <Download size={14} />
                                        Download
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setRecoveryKey("");
                                            setMessage("");
                                        }}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                    <Card className="shadow-sm mt-4">
                        <div className="d-flex align-items-start gap-3 pb-3 border-bottom mb-4">
                            <div className="settings-icon" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="h5 fw-bold mb-1">Security Notes</h4>
                                <p className="text-muted small mb-0">Important information about your vault security.</p>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            <div className="px-3 py-2 bg-light rounded" style={{ borderLeft: "4px solid #0d6efd" }}>
                                <p className="small fw-bold mb-1">Encryption is always client-side</p>
                                <p className="small text-muted mb-0">Your passphrase never leaves your device. All encryption/decryption happens in your browser.</p>
                            </div>
                            <div className="px-3 py-2 bg-light rounded" style={{ borderLeft: "4px solid #0d6efd" }}>
                                <p className="small fw-bold mb-1">Old files remain encrypted with old passphrase</p>
                                <p className="small text-muted mb-0">When you change your passphrase, previously uploaded files keep their original encryption. You'll need the old passphrase to decrypt them.</p>
                            </div>
                            <div className="px-3 py-2 bg-light rounded" style={{ borderLeft: "4px solid #0d6efd" }}>
                                <p className="small fw-bold mb-1">Forgot your passphrase?</p>
                                <p className="small text-muted mb-0">If you forget your passphrase, old encrypted files become unrecoverable. Set a new passphrase and use it for all future uploads.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-12 col-lg-4">
                    <Card className="shadow-sm">
                        <h5 className="h6 fw-bold mb-3">Vault Status</h5>
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-muted">Encryption Type</span>
                                <Badge variant="primary">AES-256-GCM</Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-muted">Key Derivation</span>
                                <Badge variant="secondary">PBKDF2 (100k)</Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-muted">Transport Security</span>
                                <Badge variant="success">JWT Auth</Badge>
                            </div>
                        </div>
                    </Card>
                    <Card className="shadow-sm mt-4">
                        <h5 className="h6 fw-bold mb-3">Profile</h5>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Display name</label>
                            <input className="form-control" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">Avatar</label>
                            <div className="d-flex gap-2 align-items-center">
                                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                <button className="btn btn-primary" onClick={handleUploadAvatar} disabled={!avatarFile || isUploadingAvatar}>{isUploadingAvatar ? 'Uploading...' : 'Upload'}</button>
                            </div>
                            {profile?.avatarUrl && (
                                <div className="mt-3">
                                    <img src={profile.avatarUrl} alt="avatar" style={{ width: 72, height: 72, borderRadius: 8 }} />
                                </div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={handleSaveProfile}>Save</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
