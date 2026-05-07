import * as React from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function RecoveryModal({ isOpen, onClose, onRecoverySuccess }) {
    const [step, setStep] = React.useState("email"); // email, key, newPassphrase, success
    const [email, setEmail] = React.useState("");
    const [recoveryKey, setRecoveryKey] = React.useState("");
    const [newPassphrase, setNewPassphrase] = React.useState("");
    const [confirmPassphrase, setConfirmPassphrase] = React.useState("");
    const [error, setError] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [resetToken, setResetToken] = React.useState("");

    const handleValidateRecoveryKey = async () => {
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/use-recovery-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, recoveryKey })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Invalid recovery key");
            }

            setResetToken(data.resetToken);
            setStep("newPassphrase");
        } catch (err) {
            setError(err.message || "Failed to validate recovery key");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetNewPassphrase = () => {
        setError("");

        if (newPassphrase !== confirmPassphrase) {
            setError("Passphrases do not match");
            return;
        }

        if (newPassphrase.length < 8) {
            setError("Passphrase must be at least 8 characters");
            return;
        }

        // Store the new passphrase locally (client-side only)
        localStorage.setItem("sv_master_passphrase_recovery", newPassphrase);
        
        setStep("success");
        setTimeout(() => {
            onRecoverySuccess?.(newPassphrase);
            onClose?.();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050
        }} onClick={onClose}>
            <div style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                <Card className="p-4">
                    {step === "email" && (
                        <>
                            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h5 className="h6 fw-bold mb-0">Recover Passphrase</h5>
                                    <p className="text-muted small mb-0">Step 1 of 2: Enter your email and recovery key</p>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger d-flex gap-2 mb-3" role="alert">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <span className="small">{error}</span>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted mb-2">Recovery Key</label>
                                <input
                                    type="text"
                                    className="form-control font-monospace"
                                    value={recoveryKey}
                                    onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                                    placeholder="Paste your recovery key here"
                                />
                                <small className="text-muted mt-1 d-block">Paste the recovery key you saved earlier</small>
                            </div>

                            <div className="d-flex gap-2">
                                <Button
                                    onClick={handleValidateRecoveryKey}
                                    disabled={!email || !recoveryKey || isLoading}
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin me-2" /> : null}
                                    Continue
                                </Button>
                                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            </div>
                        </>
                    )}

                    {step === "newPassphrase" && (
                        <>
                            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h5 className="h6 fw-bold mb-0">Set New Passphrase</h5>
                                    <p className="text-muted small mb-0">Step 2 of 2: Enter your new master passphrase</p>
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger d-flex gap-2 mb-3" role="alert">
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <span className="small">{error}</span>
                                </div>
                            )}

                            <div className="alert alert-info small mb-3">
                                Your new passphrase will be used for all future uploads and decryptions.
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-2">New Passphrase</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={newPassphrase}
                                    onChange={(e) => setNewPassphrase(e.target.value)}
                                    placeholder="Enter a new passphrase (min 8 characters)"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted mb-2">Confirm Passphrase</label>
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
                                    onClick={handleSetNewPassphrase}
                                    disabled={!newPassphrase || !confirmPassphrase}
                                >
                                    Set New Passphrase
                                </Button>
                                <Button variant="secondary" onClick={() => setStep("email")}>Back</Button>
                            </div>
                        </>
                    )}

                    {step === "success" && (
                        <>
                            <div className="text-center py-4">
                                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                                <h5 className="fw-bold mb-2">Passphrase Updated</h5>
                                <p className="text-muted small mb-0">You can now use your new passphrase for encrypting and decrypting files.</p>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
