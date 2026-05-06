import * as React from "react";
import { FileText, RefreshCw, Clock3, Database, Download, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, Badge } from "../components/ui/Card";
import { decryptFile } from "../lib/encryption";

function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(dateValue) {
    if (!dateValue) return "Unknown date";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(dateValue));
}

export default function Library() {
    const [files, setFiles] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);
    const [decryptingId, setDecryptingId] = React.useState(null);

    const loadFiles = React.useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const token = localStorage.getItem("sv_token");
            if (!token) {
                throw new Error("Authentication required");
            }

            const response = await fetch("/api/files", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Failed to load files");
            }

            setFiles(Array.isArray(payload.files) ? payload.files : []);
        } catch (error) {
            setFiles([]);
            setErrorMessage(error.message || "Failed to load files");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleDecrypt = async (file) => {
        setDecryptingId(file.id);
        try {
            const passphrase = prompt("Enter the master passphrase to decrypt:");
            if (!passphrase) {
                setDecryptingId(null);
                return;
            }

            const token = localStorage.getItem("sv_token");
            if (!token) {
                throw new Error("Authentication required");
            }

            const response = await fetch(file.downloadUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error || "Failed to download encrypted file");
            }

            const encryptedBlob = await response.blob();
            const decryptedBlob = await decryptFile(encryptedBlob, passphrase);

            const url = URL.createObjectURL(decryptedBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Decryption failed: ${error.message}`);
        } finally {
            setDecryptingId(null);
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Permanently delete this file?")) return;

        setDeletingId(fileId);
        try {
            const token = localStorage.getItem("sv_token");
            const response = await fetch(`/api/files/${fileId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Failed to delete file");
            }

            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        } catch (error) {
            alert(`Delete failed: ${error.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
                <div>
                    <p className="section-kicker mb-2">Library</p>
                    <h2 className="display-6 fw-bold mb-2 tracking-tightest">Your sovereign assets</h2>
                    <p className="text-muted fw-medium mb-0">Encrypted uploads are tracked here with their original names, sizes, and upload timestamps.</p>
                </div>
                <Button type="button" variant="secondary" className="d-inline-flex align-items-center gap-2" onClick={loadFiles} disabled={isLoading}>
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>

            {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                    <AlertCircle size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-xl-4">
                    <Card className="h-100 shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="library-metric-icon">
                                <Database size={20} />
                            </div>
                            <div>
                                <p className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: "10px", letterSpacing: "1px" }}>Encrypted Index</p>
                                <h3 className="h4 fw-bold mb-0">{files.length} files</h3>
                            </div>
                        </div>
                        <p className="text-muted mb-4">The backend stores encrypted blobs in the uploads directory and keeps only the metadata required to locate them.</p>
                        <div className="d-flex flex-wrap gap-2">
                            <Badge variant="primary">AES-256</Badge>
                            <Badge variant="secondary">Multer</Badge>
                            <Badge variant="tertiary">MongoDB</Badge>
                        </div>
                    </Card>
                </div>

                <div className="col-12 col-xl-8">
                    <Card className="p-0 shadow-sm overflow-hidden">
                        <div className="card-body">
                            {isLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
                                    <p className="text-muted mb-0">Loading encrypted assets...</p>
                                </div>
                            ) : files.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="empty-state-icon mb-3 mx-auto">
                                        <FileText size={28} />
                                    </div>
                                    <h3 className="h5 fw-bold mb-2">The vault is empty</h3>
                                    <p className="text-muted mb-0">Upload your first encrypted document and it will appear here.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {files.map((file) => (
                                        <article key={file.id} className="library-file-row">
                                            <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                                                <div className="queued-file-icon">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                                        <h4 className="h6 fw-bold mb-0 text-truncate">{file.originalName}</h4>
                                                        <Badge variant="secondary">Encrypted</Badge>
                                                    </div>
                                                    <p className="text-muted small mb-0 text-truncate">
                                                        {formatBytes(file.originalSize)} original · {formatBytes(file.encryptedSize)} stored
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 ms-md-auto mt-3 mt-md-0">
                                                <div className="text-md-end">
                                                    <p className="mb-1 small fw-bold d-flex align-items-center justify-content-md-end gap-1 text-muted">
                                                        <Clock3 size={14} />
                                                        Uploaded
                                                    </p>
                                                    <p className="mb-0 small">{formatDate(file.uploadDate)}</p>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center gap-2"
                                                        onClick={() => handleDecrypt(file)}
                                                        disabled={decryptingId === file.id}
                                                    >
                                                        {decryptingId === file.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Download size={14} />
                                                        )}
                                                        {decryptingId === file.id ? "Decrypting..." : "Decrypt locally"}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="error"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center gap-2"
                                                        onClick={() => handleDelete(file.id)}
                                                        disabled={deletingId === file.id}
                                                    >
                                                        {deletingId === file.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}