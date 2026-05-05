/**
 * Sovereign Blockchain-Lite Audit Ledger
 * Each entry contains a hash of the previous entry, ensuring immutability.
 */

async function computeHash(data) {
  const enc = new TextEncoder();
  const msgUint8 = enc.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuditLedger = {
  getLogs: async function() {
    try {
      const response = await fetch("/api/logs");
      if (!response.ok) throw new Error("Failed to fetch logs");
      return await response.json();
    } catch (error) {
      console.error("Audit fetch error:", error);
      return [];
    }
  },

  addEntry: async function(action, details) {
    const logs = await this.getLogs();
    const previousHash = logs.length > 0 ? logs[logs.length - 1].hash : '0000000000000000';
    
    const entry = {
      timestamp: new Error().stack ? new Date().toISOString() : new Date().toISOString(), // Just ensuring fresh object for safety
      action,
      details,
      previousHash
    };

    const entryString = JSON.stringify(entry);
    const hash = await computeHash(entryString);
    
    const signedEntry = { ...entry, hash };
    
    // Save to server
    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signedEntry)
      });
      if (!response.ok) throw new Error("Failed to save log");
      return await response.json();
    } catch (error) {
      console.error("Audit save error:", error);
      // Fallback to memory for this session if server fails
      return signedEntry;
    }
  },

  verifyIntegrity: async function() {
    const logs = await this.getLogs();
    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i-1];
      const current = logs[i];
      
      if (current.previousHash !== prev.hash) {
        return { valid: false, brokenIndex: i };
      }
      
      const entryData = {
        timestamp: current.timestamp,
        action: current.action,
        details: current.details,
        previousHash: current.previousHash
      };
      
      const recalculatedHash = await computeHash(JSON.stringify(entryData));
      if (recalculatedHash !== current.hash) {
        return { valid: false, brokenIndex: i };
      }
    }
    return { valid: true };
  }
};

export default AuditLedger;
