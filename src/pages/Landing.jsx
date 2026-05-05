import * as React from "react";
import { motion } from "motion/react";
import { Shield, Lock, Globe, Zap, ArrowRight, ChevronRight, Star, Menu, X } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Landing({ onGetStarted, onSignIn }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav 
        className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top px-2 px-md-4" 
        style={{ minHeight: '64px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}
        aria-label="Main navigation"
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2" aria-label="Sovereign Archive home">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '32px', height: '32px' }} aria-hidden="true">
              <Shield size={18} />
            </div>
            <div className="d-block">
              <h1 className="h6 fw-bold mb-0 text-uppercase">Sovereign</h1>
              <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '9px', letterSpacing: '1px' }}>Archive</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2 order-lg-3">
            <div className="d-none d-lg-flex align-items-center gap-1 gap-md-2">
              <Button 
                variant="ghost"
                onClick={onSignIn}
                size="sm"
                className="fw-bold text-muted text-uppercase px-2"
                style={{ fontSize: '10px', letterSpacing: '0.5px' }}
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted} 
                className="rounded-pill px-3 px-sm-4" 
                size="sm"
                style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                aria-label="Get started with Sovereign Archive"
              >
                Get Started
              </Button>
            </div>
            <button 
              className="navbar-toggler border-0 p-1 ms-1 d-lg-none shadow-none" 
              type="button" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-controls="navbar-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>

          <div 
            id="navbar-menu"
            className={`collapse navbar-collapse justify-content-center order-lg-2 ${isMenuOpen ? 'show' : ''}`}
          >
            <ul className="navbar-nav gap-3 gap-lg-4 py-3 py-lg-0">
              {["Features", "Security", "Pricing", "Enterprise"].map((item) => (
                <li key={item} className="nav-item">
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="nav-link fw-bold text-muted text-uppercase small text-center text-lg-start" 
                    style={{ letterSpacing: '1px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li className="nav-item d-lg-none pt-2 border-top">
                <div className="d-flex flex-column gap-2 p-2">
                  <Button 
                    variant="ghost"
                    onClick={onSignIn}
                    className="fw-bold text-muted text-uppercase w-100"
                    style={{ fontSize: '11px' }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={onGetStarted} 
                    className="rounded-pill w-100"
                  >
                    Get Started
                  </Button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-5 pb-5 mt-5 overflow-hidden bg-grid position-relative">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 mb-4 shadow-sm">
                  <Zap size={14} className="animate-pulse" />
                  <span className="text-uppercase fw-bold font-mono" style={{ fontSize: '10px', letterSpacing: '1px' }}>System Version 2.4.0 Live</span>
                </div>
                <h2 className="display-1 fw-black tracking-tightest mb-4 font-serif" style={{ lineHeight: '0.85', fontWeight: 800 }}>
                  SOVEREIGN <br />
                  <span className="text-primary italic">DIGITAL</span> VAULT <br />
                  ARCHIVE.
                </h2>
                <p className="lead text-muted mb-5 fw-normal pe-lg-5" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
                  The most advanced document custody system for high-value intellectual capital. Military-grade encryption meets effortless organization.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="d-flex flex-column flex-sm-row gap-3"
              >
                <Button size="lg" className="px-4 px-sm-5 py-2 py-sm-3 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-lg hover:translate-y-[-2px] transition-transform" style={{ fontSize: '15px' }} onClick={onGetStarted}>
                  Initialize Your Archive
                  <ArrowRight size={20} className="d-none d-sm-block" />
                </Button>
                <button className="btn btn-outline-dark px-4 px-sm-5 py-2 py-sm-3 rounded-pill fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '11px' }}>
                  Technical Specs
                  <ChevronRight size={16} className="d-none d-sm-block" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-5 pt-5 border-top d-flex flex-wrap align-items-center gap-4"
              >
                <div className="d-flex">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i} 
                      className="rounded-circle border border-2 border-white shadow-sm" 
                      style={{ width: '44px', height: '44px', marginLeft: i > 1 ? '-14px' : '0' }}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      alt="User profile"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <div>
                  <div className="d-flex gap-1 text-primary mb-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="mb-0 text-uppercase fw-bold text-muted" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>Safeguarding 4.2PB of sensitive data</p>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="position-relative"
              >
                <div className="bg-white rounded-5 p-2 shadow-2xl border border-2">
                  <div className="rounded-4 overflow-hidden border shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
                      alt="Secure Vault Interface" 
                      className="img-fluid w-100 object-fit-cover"
                      style={{ height: '500px' }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                {/* Floating Metrics */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="position-absolute top-10 end-0 bg-white p-3 rounded-4 shadow-xl border border-primary border-opacity-20 mt-n5 me-n3 d-none d-md-block"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                      <Lock size={22} />
                    </div>
                    <div>
                      <p className="mb-0 text-uppercase fw-bold text-muted font-mono" style={{ fontSize: '9px' }}>PROTOCOL</p>
                      <p className="mb-0 fw-black h6">E2EE ACTIVE</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="position-absolute bottom-20 start-0 bg-dark text-white p-3 rounded-4 shadow-xl border mb-n4 ms-n5 d-none d-md-block"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-white bg-opacity-10 text-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                      <Globe size={22} />
                    </div>
                    <div>
                      <p className="mb-0 text-uppercase fw-bold text-white text-opacity-50 font-mono" style={{ fontSize: '9px' }}>UPTIME</p>
                      <p className="mb-0 fw-black h6">SLA 99.999%</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Bento Style) */}
      <section id="features" className="py-5 bg-white border-top">
        <div className="container py-5">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <span className="text-primary fw-bold text-uppercase font-mono mb-3 d-block" style={{ fontSize: '11px', letterSpacing: '2px' }}>Enterprise Capabilities</span>
              <h3 className="display-4 fw-bold mb-4 font-serif">Redefining Data Sovereignty</h3>
              <p className="lead text-muted">A comprehensive ecosystem designed to give you total control over your digital legacy.</p>
            </div>
          </div>

          <div className="row g-3 g-md-4 mt-5">
            {/* Bento Grid */}
            <div className="col-lg-4 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-4 p-lg-5 rounded-5 bg-light border h-100 d-flex flex-column justify-content-between"
              >
                <div>
                  <div className="rounded-4 bg-primary text-white d-flex align-items-center justify-content-center mb-4" style={{ width: '56px', height: '56px' }}>
                    <Shield size={28} />
                  </div>
                  <h4 className="h3 fw-bold mb-3 font-serif">Zero-Knowledge Architecture</h4>
                  <p className="text-muted fw-medium font-sans">We don't trust ourselves. Your private keys never leave your device, ensuring true data independence.</p>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-8 col-md-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-4 p-lg-5 rounded-5 bg-dark text-white h-100 position-relative overflow-hidden"
              >
                <div className="position-relative z-1">
                  <div className="rounded-4 bg-white bg-opacity-10 text-white d-flex align-items-center justify-content-center mb-4" style={{ width: '56px', height: '56px' }}>
                    <Zap size={28} />
                  </div>
                  <h4 className="h3 fw-bold mb-3 font-serif text-white">Neural Search Engine</h4>
                  <p className="text-white text-opacity-70 fw-medium font-sans max-w-lg">Find documents based on semantic meaning. Sovereign's AI understands the context of your archive, not just keywords.</p>
                </div>
                <div className="position-absolute bottom-0 end-0 p-4 opacity-20 d-none d-lg-block">
                  <div className="font-mono text-uppercase" style={{ fontSize: '120px', lineHeight: '0.8' }}>AI</div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-4 p-lg-5 rounded-5 bg-white border h-100 shadow-sm"
              >
                <div className="rounded-4 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-4" style={{ width: '56px', height: '56px' }}>
                  <Globe size={28} />
                </div>
                <h4 className="h4 fw-bold mb-3 font-serif">Global Sovereignty Nodes</h4>
                <p className="text-muted fw-medium font-sans">Distributed storage across multiple jurisdictions. Your data lives everywhere and nowhere at the same time.</p>
              </motion.div>
            </div>

            <div className="col-lg-6">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-4 p-lg-5 rounded-5 bg-primary bg-opacity-5 border border-primary border-opacity-10 h-100"
              >
                <div className="rounded-4 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-4" style={{ width: '56px', height: '56px' }}>
                  <Lock size={28} />
                </div>
                <h4 className="h4 fw-bold mb-3 font-serif">Immutable Audit Ledger</h4>
                <p className="text-muted fw-medium font-sans">Every access and modification is cryptographically signed and recorded on an immutable ledger for total accountability.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs Section */}
      <section className="py-5 bg-light border-top border-bottom bg-dot-grid">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <h3 className="h2 fw-bold mb-4 font-serif">Deep Technical <br/>Assurance</h3>
              <p className="text-muted fw-medium mb-4">For those who require absolute transparency. Sovereign's infrastructure is built on open standards and verifiably secure protocols.</p>
              <ul className="list-unstyled d-flex flex-column gap-3">
                {[
                  { label: "Encryption Standard", value: "AES-GCM 256-bit" },
                  { label: "Key Derivation", value: "Argon2id v1.3" },
                  { label: "Data Residency", value: "Sovereign Jurisdictions" },
                  { label: "Search Index", value: "Semantic Embedding v4" }
                ].map((spec, i) => (
                  <li key={i} className="d-flex justify-content-between border-bottom pb-2">
                    <span className="small text-uppercase fw-bold text-muted font-mono" style={{ fontSize: '10px' }}>{spec.label}</span>
                    <span className="small fw-black font-mono text-primary">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-7">
              <div className="bg-dark rounded-4 p-4 shadow-xl border border-white border-opacity-10 position-relative overflow-hidden">
                <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-white border-opacity-10 pb-3">
                  <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                  <span className="text-white text-opacity-50 small font-mono uppercase">Live Network Status: Operational</span>
                </div>
                <div className="row g-3">
                  {[
                    { label: "Avg Encryption Latency", val: "1.2ms", trend: "-0.2" },
                    { label: "Global Node Count", val: "42", trend: "+2" },
                    { label: "Data Durability", val: "99.9999%", trend: "MAX" },
                    { label: "Active Threads", val: "1,248", trend: "+12%" }
                  ].map((metric, i) => (
                    <div key={i} className="col-6">
                      <div className="p-3 rounded-3 bg-white bg-opacity-5 border border-white border-opacity-5">
                        <p className="small text-white text-opacity-40 mb-1 font-mono" style={{ fontSize: '9px' }}>{metric.label}</p>
                        <div className="d-flex align-items-baseline gap-2">
                          <h5 className="text-white mb-0 font-mono fw-black">{metric.val}</h5>
                          <span className="text-success" style={{ fontSize: '9px' }}>{metric.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-top border-white border-opacity-10">
                  <div className="d-flex gap-1">
                    {Array.from({length: 40}).map((_, i) => (
                      <div key={i} className="flex-grow-1 bg-white opacity-10" style={{ height: Math.random() * 20 + 2, borderRadius: '1px' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
        <div className="container pt-4">
          <div className="row g-5">
            <div className="col-lg-4 col-sm-12">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center text-white" style={{ width: '36px', height: '36px' }}>
                  <Shield size={20} />
                </div>
                <h4 className="h5 fw-bold mb-0 text-uppercase tracking-wider">Sovereign Archive</h4>
              </div>
              <p className="text-white text-opacity-50 small pe-lg-5 mb-4" style={{ lineHeight: '1.8' }}>
                Redefining digital custody for the age of information sovereignty. Securely preserving human knowledge and intellectual capital through advanced asymmetric cryptography and semantic intelligence.
              </p>
              <div className="d-flex gap-3">
                {/* Social placeholders */}
                {['twitter', 'github', 'linkedin'].map(social => (
                  <button key={social} className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <div className="small text-uppercase fw-black" style={{ fontSize: '8px' }}>{social[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-lg-2 col-sm-6">
              <h6 className="text-uppercase fw-black mb-4 font-mono text-primary" style={{ fontSize: '11px', letterSpacing: '1px' }}>Product</h6>
              <ul className="list-unstyled d-flex flex-column gap-3 small text-white text-opacity-60">
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Digital Vault</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Neural Search</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Mobile Sync</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Enterprise API</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-sm-6">
              <h6 className="text-uppercase fw-black mb-4 font-mono text-primary" style={{ fontSize: '11px', letterSpacing: '1px' }}>Resources</h6>
              <ul className="list-unstyled d-flex flex-column gap-3 small text-white text-opacity-60">
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Security Whitepaper</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">API Status</a></li>
                <li><a href="#" className="nav-link p-0 hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div className="col-lg-4 col-sm-12">
              <h6 className="text-uppercase fw-black mb-4 font-mono text-primary" style={{ fontSize: '11px', letterSpacing: '1px' }}>Stay Integrated</h6>
              <p className="small text-white text-opacity-50 mb-4">Get tactical updates on security protocols and new feature deployments.</p>
              <div className="d-flex gap-2">
                <input 
                  type="email" 
                  className="form-control bg-white bg-opacity-10 border-0 text-white rounded-pill px-4 small" 
                  placeholder="name@archiver.io" 
                  style={{ fontSize: '13px' }}
                />
                <Button className="rounded-pill px-4" size="sm">Subscribe</Button>
              </div>
            </div>
          </div>

          <div className="row mt-5 pt-4 border-top border-white border-opacity-10 align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <p className="mb-0 text-white text-opacity-30 small font-mono">
                © 2024 SOVEREIGN CUSTODY GROUP. SECURED BY POLY-AES-256.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end gap-4 small">
                <a href="#" className="text-decoration-none text-white text-opacity-40 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-decoration-none text-white text-opacity-40 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-decoration-none text-white text-opacity-40 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="p-5 rounded-5 bg-white border h-100 transition-all shadow-hover">
      <div className={`rounded-4 bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center mb-4`} style={{ width: '64px', height: '64px' }}>
        <Icon size={32} />
      </div>
      <h4 className="h4 fw-bold mb-3">{title}</h4>
      <p className="text-muted mb-0 fw-medium">{desc}</p>
    </div>
  );
}
