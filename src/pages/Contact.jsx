import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contact() {
  const { addToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("/api/inquiries/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message: `Contact Message: ${message}` }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        addToast("Message sent successfully! Our managers will contact you.", "success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo message
        setTimeout(() => {
          addToast("Message submitted successfully (Offline demo mode).", "success");
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
          setLoading(false);
        }, 800);
      });
  };

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            📞 Contact & Consultations
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Get in touch with our travel representatives to verify routes and custom design packages.
          </p>
        </div>

        {/* Contact layout grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
          }}
          className="contact-layout"
        >
          {/* Left: Contact Info and Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>Connect Directly</h2>
            
            {/* CEO Card */}
            <div className="card glass" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", border: "1px solid var(--border)" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👤
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "15px", margin: 0 }}>Abdullah Khan</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CEO / Chief Planner</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "13px" }}>
                  <a href="tel:03365004848" style={{ color: "var(--secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaPhoneAlt size={10} /> Call
                  </a>
                  <a href="https://wa.me/923365004848" target="_blank" rel="noreferrer" style={{ color: "#22C55E", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaWhatsapp size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Manager Card */}
            <div className="card glass" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", border: "1px solid var(--border)" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👤
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "15px", margin: 0 }}>Waleed Ahmed</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>General Booking Manager</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "13px" }}>
                  <a href="tel:03115353751" style={{ color: "var(--secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaPhoneAlt size={10} /> Call
                  </a>
                  <a href="https://wa.me/923115353751" target="_blank" rel="noreferrer" style={{ color: "#22C55E", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaWhatsapp size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Office location */}
            <div style={{ display: "flex", gap: "15px", fontSize: "14px", color: "var(--text-muted)", marginTop: "15px" }}>
              <FaMapMarkerAlt size={20} style={{ color: "var(--secondary)" }} />
              <div>
                <strong>Khan Tourism HQ</strong>
                <p>Office #12, First Floor, Al-Rehman Plaza, G-11 Markaz, Islamabad, Pakistan.</p>
              </div>
            </div>
          </div>

          {/* Right: Message Form Card */}
          <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Send a Consultation Inquiry</h2>
            <form onSubmit={handleSubmitMessage} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ali Rizvi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="ali@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="03009876543"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Your Message / Trip Plans</label>
                <textarea
                  required
                  placeholder="Write your custom vehicle preference, destination valleys details and date logs..."
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                    resize: "none",
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }} disabled={loading}>
                {loading ? "Sending..." : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}