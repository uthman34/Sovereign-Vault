import * as React from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Card";
import { Sparkles, Send, Bot, User, Loader2, FileText, ShieldAlert } from "lucide-react";
import { askAi, summarizeDocument } from "../services/geminiService";
import { motion, AnimatePresence } from "motion/react";

export default function AIAssistant() {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Hello! I am your Sovereign AI Assistant. How can I help you manage your intellectual capital today? I can summarize documents, analyze security risks, or answer questions about your archive." }
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAi(input);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error while processing your request. Please check your connectivity and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Summarize Report", icon: FileText, prompt: "Summarize my most recent Q3 performance report." },
    { label: "Check Security", icon: ShieldAlert, prompt: "Analyze the security status of my legal documents folder." },
    { label: "Find Contracts", icon: Sparkles, prompt: "Locate all contracts expiring in the next 30 days." }
  ];

  return (
    <div className="container-fluid">
      <div className="mb-5">
        <h2 className="display-6 fw-bold mb-1 d-flex align-items-center gap-3">
          <Sparkles className="text-primary" />
          AI Intelligence
        </h2>
        <p className="text-muted fw-medium">Leverage power of generative AI to analyze and gain insights from your archive.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="p-0 border shadow-sm overflow-hidden d-flex flex-column" style={{ height: "600px" }}>
            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-4 bg-light bg-opacity-10"
            >
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`d-flex gap-3 ${msg.role === "user" ? "flex-row-reverse text-end" : ""}`}
                  >
                    <div className={`rounded-circle d-flex align-items-center justify-content-center border shadow-sm ${msg.role === "assistant" ? "bg-primary text-white" : "bg-white text-primary"}`} style={{ width: "36px", height: "36px", flexShrink: 0 }}>
                      {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div 
                      className={`p-3 rounded-4 shadow-sm max-w-75 ${msg.role === "assistant" ? "bg-white border" : "bg-primary text-white"}`}
                      style={{ maxWidth: "80%" }}
                    >
                      <p className="mb-0 small fw-medium" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="d-flex gap-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border shadow-sm" style={{ width: "36px", height: "36px" }}>
                    <Bot size={20} />
                  </div>
                  <div className="p-3 bg-white border rounded-4 shadow-sm d-flex align-items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="small text-muted fw-bold">Analyzing archive...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-top bg-white">
              <div className="d-flex gap-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask anything about your vault..." 
                  className="flex-grow-1"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-4">
          <div className="row g-4">
            <div className="col-12">
              <h4 className="h6 fw-bold mb-3 text-uppercase opacity-50" style={{ letterSpacing: "1px" }}>Quick Insights</h4>
              <div className="d-flex flex-column gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(action.prompt)}
                    className="btn btn-white border shadow-sm text-start p-3 rounded-4 hover-bg-light transition-all d-flex align-items-center gap-3 group"
                  >
                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center group-hover:scale-110 transition-transform" style={{ width: "40px", height: "40px" }}>
                      <action.icon size={20} />
                    </div>
                    <span className="fw-bold small">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12">
              <Card className="p-4 bg-gradient-to-br from-primary to-primary-dim text-white shadow-lg overflow-hidden position-relative">
                <div className="position-absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-circle translate-middle"></div>
                <div className="position-relative z-1">
                  <h5 className="fw-bold mb-2">AI Knowledge Base</h5>
                  <p className="small opacity-75 mb-0">Our AI uses Gemini 3 Flash to process massive amounts of data with low latency, providing you with real-time strategic insights.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
