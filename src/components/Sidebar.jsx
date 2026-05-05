import * as React from "react";
import { 
  LayoutDashboard, 
  Library, 
  CloudUpload, 
  ShieldCheck, 
  Settings, 
  HelpCircle,
  Plus,
  Sparkles,
  LogOut,
  X
} from "lucide-react";
import { Button } from "./ui/Button";

export function Sidebar({ currentTab, onTabChange, onSignOut, isOpen, onClose }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "library", label: "Library", icon: Library },
    { id: "upload", label: "Upload", icon: CloudUpload },
    { id: "ai", label: "AI Assistant", icon: Sparkles },
    { id: "admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <aside className={`sidebar d-flex flex-column ${isOpen ? "show" : ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-4 px-2">
        <div>
          <h1 className="h5 fw-bold text-primary text-uppercase mb-0">Sovereign Archive</h1>
          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>The Digital Vault</small>
        </div>
        <button 
          className="btn btn-link d-lg-none p-0 text-muted" 
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <Button 
        className="mb-4 w-100 d-flex align-items-center justify-content-center gap-2" 
        onClick={() => onTabChange("upload")}
        aria-label="Create new document"
      >
        <Plus size={18} aria-hidden="true" />
        <span>New Document</span>
      </Button>

      <nav className="flex-grow-1" aria-label="Sidebar navigation">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                onClick={() => onTabChange(item.id)}
                aria-current={currentTab === item.id ? "page" : undefined}
                className={`nav-link w-100 text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 transition-all ${
                  currentTab === item.id
                    ? "bg-primary bg-opacity-10 text-primary fw-bold"
                    : "text-secondary hover-bg-light"
                }`}
                style={{ background: 'transparent' }}
              >
                <item.icon size={18} aria-hidden="true" />
                <span style={{ fontSize: '14px' }}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-3 border-top">
        <button 
          className="btn btn-link text-decoration-none text-secondary w-100 text-start d-flex align-items-center gap-3 px-3 py-2"
          aria-label="System Settings"
        >
          <Settings size={18} aria-hidden="true" />
          <span style={{ fontSize: '14px' }}>Settings</span>
        </button>
        <button 
          onClick={onSignOut}
          className="btn btn-link text-decoration-none text-danger w-100 text-start d-flex align-items-center gap-3 px-3 py-2"
          aria-label="Sign out of vault"
        >
          <LogOut size={18} aria-hidden="true" />
          <span style={{ fontSize: '14px' }}>Sign Out</span>
        </button>
        
        <div className="d-flex align-items-center gap-3 px-3 py-3 mt-2">
          <img 
            alt="User Profile" 
            className="rounded-circle bg-light" 
            style={{ width: '32px', height: '32px' }}
            src="https://picsum.photos/seed/admin/100/100"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '12px' }}>Admin User</p>
            <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
