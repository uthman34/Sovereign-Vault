import * as React from "react";
import { Search, Bell, History, CloudUpload, Menu } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Card";

export function TopBar({ onTabChange, onMenuClick }) {
  return (
    <header className="top-bar justify-content-between" role="banner">
      <div className="d-flex align-items-center gap-3 flex-grow-1">
        <button 
          className="btn btn-link d-lg-none p-0 text-muted" 
          onClick={onMenuClick}
          aria-label="Toggle sidebar menu"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <div className="d-flex align-items-center flex-grow-1" style={{ maxWidth: '400px' }}>
          <div className="position-relative w-100 d-none d-sm-block">
            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={16} aria-hidden="true" />
            <Input 
              className="ps-5 rounded-pill" 
              placeholder="Search archive..." 
              aria-label="Search archive content"
            />
          </div>
        </div>
      </div>

      <nav className="d-none d-md-flex align-items-center gap-4 mx-4" aria-label="Archive quick filters">
        {["Recent", "Favorites", "Shared"].map((item) => (
          <button 
            key={item}
            className="btn btn-link text-decoration-none text-secondary fw-medium p-0"
            style={{ fontSize: '14px' }}
            aria-label={`Show ${item.toLowerCase()} documents`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-1 me-2" role="group" aria-label="Utility actions">
          <button className="btn btn-light rounded-circle p-2 text-secondary" aria-label="View notifications">
            <Bell size={18} aria-hidden="true" />
          </button>
          <button className="btn btn-light rounded-circle p-2 text-secondary" aria-label="View activity history">
            <History size={18} aria-hidden="true" />
          </button>
        </div>
        <Button 
          size="sm" 
          className="d-flex align-items-center gap-2"
          onClick={() => onTabChange("upload")}
          aria-label="Upload a new file"
        >
          <CloudUpload size={16} aria-hidden="true" />
          Upload
        </Button>
      </div>
    </header>
  );
}
