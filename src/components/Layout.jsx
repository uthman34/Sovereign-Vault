import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { motion, AnimatePresence } from "motion/react";

export function Layout({ children, currentTab, onTabChange, onSignOut, databaseHealth }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="container-fluid p-0">
      {isSidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={closeSidebar}></div>
      )}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          onTabChange(tab);
          closeSidebar();
        }}
        onSignOut={onSignOut}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        databaseHealth={databaseHealth}
      />
      <div className="main-content">
        <TopBar onTabChange={onTabChange} onMenuClick={toggleSidebar} />
        <div className="container-fluid py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
