import * as React from "react";
import { CloudUpload, FileText, LockKeyhole, Trash2, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, Badge, Input } from "../components/ui/Card";
import { encryptFile } from "../lib/encryption";

function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;
    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function Upload() {
    const fileInputRef = React.useRef(null);
    const [queuedFiles, setQueuedFiles] = React.useState([]);
    const [passphrase, setPassphrase] = React.useState("");
    const [isDragging, setIsDragging] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    const addFiles = (incomingFiles) => {
        const nextFiles = incomingFiles.filter(Boolean);
        if (nextFiles.length === 0) return;

        setQueuedFiles((currentFiles) => {
            const seen = new Set(currentFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
            const merged = [...currentFiles];

            nextFiles.forEach((file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(file);
                }
            });

            return merged;
        });
    };

    const handleBrowse = () => {
        fileInputRef.current?.click();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(event.dataTransfer.files || []));
    };

    const handleSubmit = async () => {
        if (!queuedFiles.length) {
            setErrorMessage("Choose at least one file to protect.");
            return;
        }

        if (!passphrase.trim()) {
            setErrorMessage("Enter the master passphrase before uploading.");
            return;
        }

        const token = localStorage.getItem("sv_token");
        if (!token) {
            setErrorMessage("Authentication required. Please sign in.");
            return;
        }

        setIsUploading(true);
        setErrorMessage("");
        setStatusMessage("Encrypting files locally...");

        try {
            for (const file of queuedFiles) {
                setStatusMessage(`Encrypting ${file.name} with AES-256...`);
                const encryptedBlob = await encryptFile(file, passphrase.trim());
                const encryptedFile = new File([encryptedBlob], `${file.name}.enc`, {
                    type: "application/octet-stream",
                });

                const formData = new FormData();
                formData.append("file", encryptedFile, encryptedFile.name);
                formData.append("originalName", file.name);
                formData.append("originalSize", String(file.size));
                formData.append("mimeType", file.type || "application/octet-stream");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(payload.error || `Failed to upload ${file.name}`);
                }
            }

            setQueuedFiles([]);
            setPassphrase("");
            setStatusMessage("All files encrypted and uploaded successfully.");
        } catch (error) {
            setErrorMessage(error.message || "Upload failed");
            setStatusMessage("");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container-fluid upload-page">
            <div className="row g-4 align-items-start">
                <div className="col-12 col-xl-7">
                    <div className="mb-4">
                        <p className="section-kicker mb-2">Secure Transfer</p>
                        <h2 className="display-6 fw-bold mb-2 tracking-tightest">Encrypt locally, then upload the sealed blob.</h2>
                        <p className="text-muted fw-medium mb-0">
                            Files are transformed in the browser with AES-256 before they ever leave the device.
                        </p>
                    </div>

                    <Card className="upload-dropzone p-0 overflow-hidden border-0 shadow-sm">
                        <div
                            className={`upload-dropzone-surface ${isDragging ? "is-active" : ""}`}
                            onClick={handleBrowse}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleBrowse();
                                }
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="d-none"
                                onChange={(event) => addFiles(Array.from(event.target.files || []))}
                            />

                            <div className="upload-icon-shell mb-4">
                                <CloudUpload size={36} />
                            </div>
                            <h3 className="h3 fw-bold mb-2">Drop files here or browse</h3>
                            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "520px" }}>
                                PDF, DOCX, XLSX, ZIP, images, and more. The selected files are encrypted on the client with your master passphrase.
                            </p>

                            <div className="row g-3 justify-content-center mb-4">
                                <div className="col-12 col-md-5">
                                    <label className="form-label text-uppercase small fw-bold text-muted mb-2">Master Passphrase</label>
                                    <Input
                                        type="password"
                                        value={passphrase}
                                        onChange={(event) => setPassphrase(event.target.value)}
                                        placeholder="Enter your vault passphrase"
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="col-12 col-md-5">
                                    <label className="form-label text-uppercase small fw-bold text-muted mb-2">Selected Files</label>
                                    <Input
                                        value={`${queuedFiles.length} file${queuedFiles.length === 1 ? "" : "s"} queued`}
                                        readOnly
                                        aria-label="Queued files summary"
                                    />
                                </div>
                            </div>

                            <div className="d-flex flex-wrap justify-content-center gap-3">
                                <Button type="button" size="lg" className="px-4 d-inline-flex align-items-center gap-2" onClick={handleSubmit} disabled={isUploading}>
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
                                    {isUploading ? "Encrypting..." : "Encrypt and Upload"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    className="px-4 d-inline-flex align-items-center gap-2"
                                    onClick={() => setQueuedFiles([])}
                                    disabled={isUploading || queuedFiles.length === 0}
                                >
                                    <Trash2 size={18} />
                                    Clear Queue
                                </Button>
                            </div>

                            <div className="d-flex flex-wrap justify-content-center gap-4 mt-4 text-muted small fw-bold text-uppercase">
                                <div className="d-flex align-items-center gap-2">
                                    <ShieldCheck size={16} className="text-primary" />
                                    Zero-Knowledge Transport
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Encrypted Before Upload
                                </div>
                            </div>
                        </div>
                    </Card>

                    {errorMessage && (
                        <div className="alert alert-danger mt-3 d-flex align-items-center gap-2" role="alert">
                            <AlertCircle size={18} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {statusMessage && !errorMessage && (
                        <div className="alert alert-success mt-3 d-flex align-items-center gap-2" role="status">
                            <CheckCircle2 size={18} />
                            <span>{statusMessage}</span>
                        </div>
                    )}
                </div>

                <div className="col-12 col-xl-5">
                    <Card className="p-0 shadow-sm overflow-hidden">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div>
                                    <p className="section-kicker mb-1">Queue</p>
                                    <h3 className="h5 fw-bold mb-0">Prepared assets</h3>
                                </div>
                                <Badge variant="primary">{queuedFiles.length}</Badge>
                            </div>

                            {queuedFiles.length === 0 ? (
                                <div className="empty-state text-center py-5 px-3">
                                    <div className="empty-state-icon mb-3">
                                        <FileText size={28} />
                                    </div>
                                    <h4 className="h5 fw-bold mb-2">No files queued</h4>
                                    <p className="text-muted mb-0">Choose a document or drag one into the drop area to begin encryption.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {queuedFiles.map((file) => (
                                        <div key={`${file.name}-${file.size}-${file.lastModified}`} className="queued-file-item">
                                            <div className="d-flex align-items-start gap-3">
                                                <div className="queued-file-icon">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <p className="mb-1 fw-bold text-truncate">{file.name}</p>
                                                    <p className="mb-0 text-muted small">
                                                        {formatBytes(file.size)} · {file.type || "application/octet-stream"}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">Ready</Badge>
                                            </div>
                                        </div>
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
