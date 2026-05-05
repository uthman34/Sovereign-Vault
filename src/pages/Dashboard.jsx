import * as React from "react";
import AuditLedger from "../lib/audit";
import { Card, Badge } from "../components/ui/Card";
import {
  Folder,
  FileText,
  Briefcase,
  Download,
  MoreVertical,
  History,
  Key,
  CloudDownload,
  AlertTriangle,
  Star,
  Users,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    const fetchLogs = async () => {
      const data = await AuditLedger.getLogs();
      setLogs(data.slice(-4).reverse()); // Just show the last 4 for the feed
    };
    fetchLogs();
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-5 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="display-6 fw-bold mb-1">Archive Overview</h2>
          <p className="text-muted fw-medium mb-0">Welcome back, Admin. Your vault is secured and synchronized.</p>
        </div>
        <Badge variant="primary" className="d-flex align-items-center gap-2 py-2 px-3 shadow-sm border-0">
          <Sparkles size={14} />
          AI Core Active
        </Badge>
      </div>

      <div className="row g-4">
        {/* Left Column: Primary Stats & Storage */}
        <div className="col-12 col-xl-8">
          <div className="row g-4">
            {/* Storage Section */}
            <div className="col-12">
              <Card className="p-4 bg-light border-0">
                <div className="row align-items-center">
                  <div className="col-md-4 d-flex justify-content-center mb-4 mb-md-0">
                    <div className="position-relative" style={{ width: '180px', height: '180px' }}>
                      <svg className="w-100 h-100 transform -rotate-90" viewBox="0 0 192 192">
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="#e9ecef" strokeWidth="12" />
                        <circle
                          cx="96" cy="96" r="88"
                          fill="transparent"
                          stroke="var(--primary-color)"
                          strokeWidth="12"
                          strokeDasharray="552.9"
                          strokeDashoffset="165.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle text-center">
                        <span className="h2 fw-bold d-block mb-0">72%</span>
                        <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Capacity</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h3 className="h4 fw-bold mb-2">Vault Utilization</h3>
                    <p className="text-muted small mb-4">You have used 1.4 TB of your 2.0 TB encrypted storage. Expand your capacity anytime in settings.</p>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="p-3 rounded-3 bg-white shadow-sm border">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="rounded-circle bg-primary" style={{ width: '8px', height: '8px' }}></span>
                            <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Documents</span>
                          </div>
                          <p className="h5 fw-bold mb-0">842 GB</p>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 rounded-3 bg-white shadow-sm border">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="rounded-circle bg-info" style={{ width: '8px', height: '8px' }}></span>
                            <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Media Assets</span>
                          </div>
                          <p className="h5 fw-bold mb-0">510 GB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pinned Collections */}
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 fw-bold mb-0">Pinned Collections</h3>
                <button className="btn btn-link text-decoration-none fw-bold small p-0">View All</button>
              </div>
              <div className="row g-4">
                <div className="col-md-4">
                  <CollectionCard
                    title="Strategic Planning 2024"
                    items={128}
                    updated="2h ago"
                    icon={Folder}
                    variant="primary"
                    collaborators={["A", "B", "C"]}
                  />
                </div>
                <div className="col-md-4">
                  <CollectionCard
                    title="Financial Audit Logs"
                    items={45}
                    updated="Yesterday"
                    icon={FileText}
                    variant="secondary"
                    confidential
                  />
                </div>
                <div className="col-md-4">
                  <CollectionCard
                    title="Legal Frameworks"
                    items={212}
                    updated="3d ago"
                    icon={Briefcase}
                    variant="info"
                    encrypted
                  />
                </div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="col-12">
              <h3 className="h5 fw-bold mb-4">Recent Documents</h3>
              <Card className="p-0 overflow-hidden border">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Name</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Visibility</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small">Modified</th>
                        <th className="px-4 py-3 text-uppercase fw-bold text-muted small text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <DocumentRow name="Annual_Report_Q3.pdf" size="4.2 MB" type="PDF" visibility="Shared" modified="15 min ago" color="text-danger" />
                      <DocumentRow name="Compliance_Checklist.docx" size="1.1 MB" type="Word Doc" visibility="Private" modified="1 hour ago" color="text-primary" />
                      <DocumentRow name="Project_Roadmap_V2.xlsx" size="850 KB" type="Excel" visibility="Public" modified="3 hours ago" color="text-info" />
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Trends */}
        <div className="col-12 col-xl-4">
          <div className="row g-4">
            <div className="col-12">
              <Card className="p-4">
                <h3 className="h5 fw-bold mb-4">Security Audit Feed</h3>
                <div className="position-relative ps-3 border-start border-2">
                  {logs.length === 0 ? (
                    <div className="py-4 text-center text-muted small">No active audit trails identified.</div>
                  ) : logs.map((log, i) => (
                    <AuditItem
                      key={i}
                      icon={log.action.includes('LOCK') || log.action.includes('ENCRYPT') ? Key : History}
                      title={log.action}
                      desc={log.details}
                      time={new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      color={i === 0 ? "primary" : "secondary"}
                    />
                  ))}
                </div>
                <button className="btn btn-outline-light text-dark fw-bold small w-100 mt-4 py-2 border">
                  View Full Audit Log
                </button>
              </Card>
            </div>

            <div className="col-12">
              <div className="p-4 rounded-4 text-white position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dim))' }}>
                <div className="position-relative z-1">
                  <Star className="mb-3" size={32} />
                  <h3 className="h4 fw-bold mb-2">Need more space?</h3>
                  <p className="small opacity-75 mb-4">Upgrade to Elite Archiver for 10 TB storage and AI-powered document indexing.</p>
                  <button className="btn btn-white bg-white text-primary fw-bold w-100 py-2">Get Started</button>
                </div>
              </div>
            </div>

            <div className="col-12">
              <Card className="p-4 bg-light border-0">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Users className="text-secondary" size={20} />
                  <h4 className="h6 fw-bold mb-0">Recently Shared</h4>
                </div>
                <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 border shadow-sm">
                  <div className="rounded-3 bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <ImageIcon size={20} className="text-muted" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="small fw-bold mb-0 text-truncate">Brand_Identity_v4.ai</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>Shared by Kevin Lee</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ title, items, updated, icon: Icon, variant, collaborators, confidential, encrypted }) {
  return (
    <Card className="p-4 h-100 shadow-hover transition-all">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className={`rounded-3 bg-${variant} bg-opacity-10 text-${variant} d-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px' }}>
          <Icon size={24} />
        </div>
        <button className="btn btn-link text-muted p-0"><MoreVertical size={18} /></button>
      </div>
      <h4 className="h6 fw-bold mb-1 text-truncate">{title}</h4>
      <p className="text-muted mb-4" style={{ fontSize: '12px' }}>{items} items • Updated {updated}</p>

      <div className="d-flex align-items-center justify-content-between">
        {collaborators && (
          <div className="d-flex">
            {collaborators.map((c, i) => (
              <img
                key={i}
                className="rounded-circle border border-white"
                style={{ width: '24px', height: '24px', marginLeft: i > 0 ? '-8px' : '0' }}
                src={`https://picsum.photos/seed/${c}/100/100`}
                alt="Collaborator"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="rounded-circle bg-light border border-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '24px', height: '24px', marginLeft: '-8px', fontSize: '8px' }}>+4</div>
          </div>
        )}
        {confidential && (
          <span className="badge bg-danger bg-opacity-10 text-danger text-uppercase fw-bold" style={{ fontSize: '8px' }}>Confidential</span>
        )}
        {encrypted && (
          <div className="d-flex align-items-center gap-1 text-muted">
            <Key size={12} />
            <span className="text-uppercase fw-bold" style={{ fontSize: '8px' }}>Encrypted</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function DocumentRow({ name, size, type, visibility, modified, color }) {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <FileText className={color} size={20} />
          <div>
            <p className="mb-0 fw-bold small">{name}</p>
            <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>{type} • {size}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={visibility === "Shared" ? "tertiary" : visibility === "Private" ? "secondary" : "primary"}>
          {visibility}
        </Badge>
      </td>
      <td className="px-4 py-3 small text-muted font-medium">{modified}</td>
      <td className="px-4 py-3 text-end">
        <button className="btn btn-link text-muted p-0">
          <Download size={18} />
        </button>
      </td>
    </tr>
  );
}

function AuditItem({ icon: Icon, title, desc, time, color }) {
  return (
    <div className="mb-4 position-relative">
      <div className={`position-absolute start-0 top-0 translate-middle-x bg-white rounded-circle border-2 border-${color} d-flex align-items-center justify-content-center`} style={{ width: '20px', height: '20px', marginLeft: '-1px' }}>
        <Icon size={10} className={`text-${color}`} />
      </div>
      <div className="ps-3">
        <p className="mb-0 fw-bold small">{title}</p>
        <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>{desc}</p>
        <p className={`mb-0 fw-bold ${color === 'primary' ? 'text-primary' : 'text-muted opacity-50'}`} style={{ fontSize: '10px' }}>{time}</p>
      </div>
    </div>
  );
}
