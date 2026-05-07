import * as React from "react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import { Card, Badge } from "./components/ui/Card";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { AuditLedger } from "./lib/audit";
import Library from "./pages/Library";
import Upload from "./pages/Upload";

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
                  <td className="px-4 py-3 text-nowrap"><Badge variant="secondary" style={{ fontSize: '9px' }}>{log.action}</Badge></td>
                  <td className="px-4 py-3 small">{log.details}</td>
                  <td className="px-4 py-3 text-end">
                    <code className="text-primary small" style={{ fontSize: '10px' }}>{log.hash.substring(0, 16)}...</code>
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
  const [databaseHealth, setDatabaseHealth] = React.useState({
    mode: "Disconnected",
    status: "disconnected",
  });

  React.useEffect(() => {
    let isMounted = true;

    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Health check failed");
        }

        const payload = await response.json();
        if (isMounted) {
          setDatabaseHealth(payload.database || { mode: "Disconnected", status: "disconnected" });
        }
      } catch (error) {
        if (isMounted) {
          setDatabaseHealth({ mode: "Disconnected", status: "disconnected" });
        }
      }
    };

    fetchHealth();
    const intervalId = window.setInterval(fetchHealth, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

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
      case "settings": return <Settings />;
      case "admin": return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onSignOut={handleSignOut}
      databaseHealth={databaseHealth}
    >
      {renderContent()}
    </Layout>
  );
}
