import * as React from "react";
import { Card, Badge } from "../components/ui/Card";
import { FileText, History, Key, Star, Users, Image as ImageIcon, Sparkles, Folder, Briefcase } from "lucide-react";

const TOTAL_QUOTA_BYTES = 2 * 1024 * 1024 * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function isMediaFile(file) {
  const mimeType = (file.type || file.mimeType || "").toLowerCase();
  return mimeType.startsWith("image/") || mimeType.startsWith("video/") || mimeType.startsWith("audio/");
}

export default function Dashboard() {
  const [files, setFiles] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("sv_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const [filesResponse, logsResponse] = await Promise.all([
          fetch("/api/files", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/logs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const filesPayload = await filesResponse.json().catch(() => ({}));
        const logsPayload = await logsResponse.json().catch(() => ([]));

        if (!filesResponse.ok) {
          throw new Error(filesPayload.error || "Failed to load files");
        }

        if (!logsResponse.ok) {
          throw new Error((logsPayload && logsPayload.error) || "Failed to load logs");
        }

        if (isMounted) {
          setFiles(Array.isArray(filesPayload.files) ? filesPayload.files : []);
          setLogs(Array.isArray(logsPayload) ? logsPayload : []);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setFiles([]);
          setLogs([]);
          setErrorMessage(error.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalEncryptedBytes = files.reduce((sum, file) => sum + Number(file.encryptedSize || 0), 0);
  const utilizationPercent = Math.min(100, (totalEncryptedBytes / TOTAL_QUOTA_BYTES) * 100);
  const utilizationPercentLabel = utilizationPercent > 0 && utilizationPercent < 0.01
    ? "<0.01%"
    : `${utilizationPercent.toFixed(2)}%`;
  const recentFiles = [...files].slice(0, 3);
  const recentLogs = [...logs].slice(-4).reverse();

  const documentFiles = files.filter((file) => !isMediaFile(file));
  const mediaFiles = files.filter(isMediaFile);

  const documentBytes = documentFiles.reduce((sum, file) => sum + Number(file.encryptedSize || 0), 0);
  const mediaBytes = mediaFiles.reduce((sum, file) => sum + Number(file.encryptedSize || 0), 0);

  const stats = [
    { label: "Documents", count: documentFiles.length, bytes: documentBytes, icon: Folder, variant: "primary" },
    { label: "Media Assets", count: mediaFiles.length, bytes: mediaBytes, icon: Briefcase, variant: "secondary" },
    { label: "All Files", count: files.length, bytes: totalEncryptedBytes, icon: FileText, variant: "info" },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-5 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="display-6 fw-bold mb-1">Archive Overview</h2>
          <p className="text-muted fw-medium mb-0">Live storage and audit data from your MERN backend.</p>
        </div>
        <Badge variant="primary" className="d-flex align-items-center gap-2 py-2 px-3 shadow-sm border-0">
          <Sparkles size={14} />
          Real-time data
        </Badge>
      </div>

      {errorMessage && (
        <div className="alert alert-danger mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="row g-4">
            <div className="col-12">
              <Card className="p-4 bg-light border-0">
                <div className="row align-items-center">
                  <div className="col-md-4 d-flex justify-content-center mb-4 mb-md-0">
                    <div className="position-relative" style={{ width: "180px", height: "180px" }}>
                      <svg className="w-100 h-100 transform -rotate-90" viewBox="0 0 192 192">
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="#e9ecef" strokeWidth="12" />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="transparent"
                          stroke="var(--primary-color)"
                          strokeWidth="12"
                          strokeDasharray="552.9"
                          strokeDashoffset={552.9 - (552.9 * utilizationPercent) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <span className="h2 fw-bold d-block mb-0">{isLoading ? "--" : utilizationPercentLabel}</span>
                        <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "10px" }}>Capacity</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h3 className="h4 fw-bold mb-2">Vault Utilization</h3>
                    <p className="text-muted small mb-4">
                      {isLoading
                        ? "Loading your encrypted storage usage..."
                        : `You have used ${formatBytes(totalEncryptedBytes)} of your 2.0 TB encrypted storage.`}
                    </p>
                    <div className="row g-3">
                      {stats.map((stat) => (
                        <div className="col-12 col-lg-4" key={stat.label}>
                          <div className="p-3 rounded-3 bg-white shadow-sm border h-100">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className={`rounded-circle bg-${stat.variant}`} style={{ width: "8px", height: "8px" }}></span>
                              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: "10px" }}>{stat.label}</span>
                            </div>
                            <p className="h5 fw-bold mb-0">{stat.count} files</p>
                            <p className="small text-muted mb-0">{formatBytes(stat.bytes)} stored</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-12">
              <h3 className="h5 fw-bold mb-4">Recent Documents</h3>
              <Card className="p-0 overflow-hidden border">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Name</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Type</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Modified</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small text-end">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFiles.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-5 text-muted">No files uploaded yet.</td>
                        </tr>
                      ) : (
                        recentFiles.map((file) => (
                          <DocumentRow
                            key={file.id}
                            name={file.originalName || file.name}
                            type={file.mimeType || file.type || "File"}
                            modified={file.uploadDate || file.date}
                            size={formatBytes(file.originalSize || file.size || 0)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="row g-4">
            <div className="col-12">
              <Card className="p-4">
                <h3 className="h5 fw-bold mb-4">Security Audit Feed</h3>
                <div className="position-relative ps-3 border-start border-2">
                  {recentLogs.length === 0 ? (
                    <div className="py-4 text-center text-muted small">No active audit trails identified.</div>
                  ) : (
                    recentLogs.map((log, i) => (
                      <AuditItem
                        key={log.hash || i}
                        icon={log.action?.includes("UPLOAD") ? FileText : log.action?.includes("DELETE") ? Key : History}
                        title={log.action}
                        desc={log.details}
                        time={new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        color={i === 0 ? "primary" : "secondary"}
                      />
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div className="col-12">
              <div className="p-4 rounded-4 text-white position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary-color), var(--primary-dim))" }}>
                <div className="position-relative z-1">
                  <Star className="mb-3" size={32} />
                  <h3 className="h4 fw-bold mb-2">Need more space?</h3>
                  <p className="small opacity-75 mb-4">Scale your encrypted storage as the vault grows.</p>
                  <button className="btn btn-white bg-white text-primary fw-bold w-100 py-2">Get Started</button>
                </div>
              </div>
            </div>

            <div className="col-12">
              <Card className="p-4 bg-light border-0">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Users className="text-secondary" size={20} />
                  <h4 className="h6 fw-bold mb-0">Latest File</h4>
                </div>
                {recentFiles[0] ? (
                  <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 border shadow-sm">
                    <div className="rounded-3 bg-light d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                      <ImageIcon size={20} className="text-muted" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="small fw-bold mb-0 text-truncate">{recentFiles[0].originalName || recentFiles[0].name}</p>
                      <p className="mb-0 text-muted" style={{ fontSize: "10px" }}>
                        Uploaded {new Date(recentFiles[0].uploadDate || recentFiles[0].date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted small">No files yet.</div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ name, type, modified, size }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <FileText className="text-danger" size={20} />
          <div>
            <p className="mb-0 fw-bold small">{name}</p>
            <p className="mb-0 text-muted" style={{ fontSize: "10px" }}>{type}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 small text-muted">{type}</td>
      <td className="px-4 py-3 small text-muted font-medium">{new Date(modified).toLocaleString()}</td>
      <td className="px-4 py-3 text-end small text-muted">{size}</td>
    </tr>
  );
}

function AuditItem({ icon: Icon, title, desc, time, color }) {
  return (
    <div className="mb-4 position-relative">
      <div className={`position-absolute start-0 top-0 translate-middle-x bg-white rounded-circle border-2 border-${color} d-flex align-items-center justify-content-center`} style={{ width: "20px", height: "20px", marginLeft: "-1px" }}>
        <Icon size={10} className={`text-${color}`} />
      </div>
      <div className="ps-3">
        <p className="mb-0 fw-bold small">{title}</p>
        <p className="mb-1 text-muted" style={{ fontSize: "11px" }}>{desc}</p>
        <p className={`mb-0 fw-bold ${color === "primary" ? "text-primary" : "text-muted opacity-50"}`} style={{ fontSize: "10px" }}>{time}</p>
      </div>
    </div>
  );
}
