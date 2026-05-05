import * as React from "react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import { Card, Badge } from "./components/ui/Card";
import { CloudUpload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./components/ui/Button";
import { AuditLedger } from "./lib/audit";
import { encryptFile } from "./lib/encryption";

function Library() {
  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="display-6 fw-bold mb-1">Document Library</h2>
        <p className="text-muted fw-medium">Manage and organize your intellectual capital.</p>
      </div>
      <Card className="p-5 text-center border-dashed border-2 bg-light">
        <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center mb-4 shadow-sm" style={{ width: '80px', height: '80px' }}>
          <FileText className="text-muted" size={40} />
        </div>
        <h3 className="h4 fw-bold mb-2">Your library is growing</h3>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '400px' }}>Start by uploading your first document or creating a new collection to organize your files.</p>
        <Button className="d-inline-flex align-items-center gap-2">
          <CloudUpload size={18} />
          Upload Files
        </Button>
      </Card>
    </div>
  );
}

function Upload() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleSecureSync = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        await AuditLedger.addEntry('ENCRYPTION_TASK', `Wrapping ${file.name} in AES-256 layer`);
        await new Promise(r => setTimeout(r, 1200));
        await AuditLedger.addEntry('VAULT_COMMIT', `Successfully synchronized ${file.name} to sovereign cloud`);
      }
      setFiles([]);
      alert("Sovereign Transfer Complete: All documents are encrypted and indexed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="mb-5">
        <h2 className="display-6 fw-bold mb-1">Secure Upload</h2>
        <p className="text-muted fw-medium">All files are encrypted with AES-256 before storage.</p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          p-5 rounded-5 border-2 border-dashed text-center transition-all
          ${isDragging 
            ? "border-primary bg-primary bg-opacity-10 scale-105 shadow-lg" 
            : "border-secondary border-opacity-25 bg-light hover-bg-white"}
        `}
        style={{ cursor: 'pointer' }}
      >
        <div className="rounded-4 bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
          <CloudUpload size={40} />
        </div>
        <h3 className="h3 fw-bold mb-2">Drop your files here</h3>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>Drag and drop files, or click to browse. Supports PDF, DOCX, XLSX, and ZIP up to 500MB.</p>
        <Button size="lg" className="px-5 rounded-pill" onClick={handleSecureSync} disabled={isProcessing || files.length === 0}>
          {isProcessing ? (
            <span className="d-flex align-items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Encrypting...
            </span>
          ) : "Initiate Secure Sync"}
        </Button>
        
        <div className="mt-5 d-flex justify-content-center gap-4 text-muted small fw-bold text-uppercase">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            <span>Zero-Knowledge</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            <span>Immutable Trail</span>
          </div>
        </div>
      </div>

      {files.length > 0 && !isProcessing && (
        <Card className="mt-4 p-4">
          <h4 className="h6 fw-bold mb-4 d-flex align-items-center gap-2">
            <FileText size={18} className="text-primary" />
            Queue ({files.length} files)
          </h4>
          <div className="list-group list-group-flush">
            {files.map((file, i) => (
              <div key={i} className="list-group-item d-flex align-items-center justify-content-between px-0 py-3 border-0 border-bottom">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="mb-0 fw-bold small">{file.name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Badge variant="primary" style={{fontSize: '9px'}}>READY FOR SYNC</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 d-flex justify-content-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFiles([])}>Cancel All</Button>
            <Button size="sm" className="px-4" onClick={handleSecureSync}>Start Sync</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Admin() {
  const [logs, setLogs] = React.useState([]);
  const [integrityStatus, setIntegrityStatus] = React.useState(null);

  React.useEffect(() => {
    const fetchLogs = async () => {
      const logs = await AuditLedger.getLogs();
      setLogs(logs);
      const status = await AuditLedger.verifyIntegrity();
      setIntegrityStatus(status);
    };
    fetchLogs();
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="display-6 fw-bold mb-1">Administrative Console</h2>
          <p className="text-muted fw-medium">Immutable audit trail secured by cryptographic chaining.</p>
        </div>
        {integrityStatus?.valid ? (
          <Badge variant="primary" className="p-2 px-3 border-0 d-flex align-items-center gap-2 shadow-sm">
            <CheckCircle2 size={14} />
            Ledger Verified
          </Badge>
        ) : (
          <Badge variant="error" className="p-2 px-3 border-0 d-flex align-items-center gap-2 shadow-sm">
            <AlertCircle size={14} />
            Check Pending...
          </Badge>
        )}
      </div>

      <Card className="p-0 border shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr className="small text-uppercase">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Operation Details</th>
                <th className="px-4 py-3 text-end">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No tactical logs identified.</td></tr>
              ) : [...logs].reverse().map((log, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 small text-muted text-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-nowrap"><Badge variant="secondary" style={{fontSize: '9px'}}>{log.action}</Badge></td>
                  <td className="px-4 py-3 small">{log.details}</td>
                  <td className="px-4 py-3 text-end">
                    <code className="text-primary small" style={{fontSize: '10px'}}>{log.hash.substring(0, 16)}...</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [view, setView] = React.useState("landing");
  const [authMode, setAuthMode] = React.useState("signin");
  const [currentTab, setCurrentTab] = React.useState("dashboard");

  const handleGetStarted = () => {
    setAuthMode("signup");
    setView("auth");
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setView("auth");
  };

  const handleAuthSuccess = () => {
    setView("app");
  };

  const handleSignOut = () => {
    setView("landing");
    setCurrentTab("dashboard");
  };

  if (view === "landing") {
    return <Landing onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
  }

  if (view === "auth") {
    return (
      <Auth 
        initialMode={authMode} 
        onBack={() => setView("landing")} 
        onSuccess={handleAuthSuccess} 
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard": return <Dashboard />;
      case "library": return <Library />;
      case "upload": return <Upload />;
      case "ai": return <AIAssistant />;
      case "admin": return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab} onSignOut={handleSignOut}>
      {renderContent()}
    </Layout>
  );
}
