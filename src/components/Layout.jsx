import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FaSun,
  FaMoon,
  FaWhatsapp,
  FaPhone,
  FaChevronUp,
  FaTimes,
  FaBars,
  FaExchangeAlt,
  FaUser,
  FaCompass,
  FaCar,
  FaPlane,
  FaHome,
  FaWrench,
  FaTasks,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";

export default function Layout({ children }) {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    toasts,
    removeToast,
    compareCars,
    clearCompareCars,
    compareTours,
    clearCompareTours,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareType, setCompareType] = useState("cars"); // 'cars' or 'tours'
  const navigate = useNavigate();

  // Scroll listener for Back to Top & Navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getActiveStyle = ({ isActive }) => ({
    color: isActive ? "var(--secondary)" : "var(--text)",
    fontWeight: isActive ? "700" : "500",
    borderBottom: isActive ? "2px solid var(--secondary)" : "2px solid transparent",
  });

  const getMobileActiveStyle = ({ isActive }) => ({
    background: isActive ? "rgba(34, 197, 94, 0.15)" : "transparent",
    color: isActive ? "var(--secondary)" : "var(--text)",
    fontWeight: isActive ? "700" : "500",
  });

  const handleOpenCompare = (type) => {
    setCompareType(type);
    setShowCompareModal(true);
  };

  // Callback simulation
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const { addToast } = useApp();

  const handleRequestCallback = (e) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone) {
      addToast("Please fill in all fields.", "warning");
      return;
    }
    // Simulate sending inquiry to Express backend
    fetch("/api/inquiries/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: callbackName, phone: callbackPhone }),
    })
      .then((res) => res.json())
      .then((data) => {
        addToast("Callback requested! We will call you within 15 minutes.", "success");
        setShowCallbackModal(false);
        setCallbackName("");
        setCallbackPhone("");
      })
      .catch((err) => {
        // Fallback if server is not active
        addToast("Callback requested successfully (Offline mode).", "success");
        setShowCallbackModal(false);
        setCallbackName("");
        setCallbackPhone("");
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 5%",
          height: "75px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--heading)",
              fontSize: "24px",
              fontWeight: "800",
              letterSpacing: "1px",
              background: "linear-gradient(135deg, #22C55E 0%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            KHAN TOURISM
          </span>
        </Link>

        {/* Desktop Navbar */}
        <nav
          style={{
            display: "none",
            gap: "24px",
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          <NavLink to="/" style={getActiveStyle} className="nav-link-item">Home</NavLink>
          <NavLink to="/cars" style={getActiveStyle} className="nav-link-item">Cars</NavLink>
          <NavLink to="/tours" style={getActiveStyle} className="nav-link-item">Tours</NavLink>
          <NavLink to="/planner" style={getActiveStyle} className="nav-link-item">Planner</NavLink>
          <NavLink to="/airport" style={getActiveStyle} className="nav-link-item">Airport Pickup</NavLink>
          <NavLink to="/contact" style={getActiveStyle} className="nav-link-item">Contact</NavLink>
        </nav>

        {/* Action buttons (Right) */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              padding: "5px",
            }}
            title="Toggle light/dark mode"
          >
            {theme === "dark" ? <FaSun style={{ color: "var(--accent)" }} /> : <FaMoon />}
          </button>

          {/* User profile portal link */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="header-profile">
              <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--secondary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    overflow: "hidden",
                    border: "2px solid var(--border)",
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }} className="desktop-nav-profile-name">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              {(user.role === "admin" || user.role === "manager") && (
                <Link
                  to="/admin"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    borderRadius: "20px",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--accent)",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaWrench size={10} /> Admin
                </Link>
              )}
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
                className="desktop-nav"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/profile"
              className="btn btn-primary"
              style={{ padding: "8px 18px", borderRadius: "30px", fontSize: "14px" }}
            >
              <FaUser size={12} /> Sign In
            </Link>
          )}

          {/* Hamburger button for mobile */}
          <button
            onClick={toggleMobileMenu}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "22px",
              display: "none",
            }}
            className="mobile-hamburger"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "75px",
            left: 0,
            width: "100%",
            height: "calc(100vh - 75px)",
            backgroundColor: "var(--bg-card)",
            zIndex: 998,
            padding: "30px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <NavLink to="/" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaHome style={{ marginRight: "10px" }} /> Home
          </NavLink>
          <NavLink to="/cars" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaCar style={{ marginRight: "10px" }} /> Cars
          </NavLink>
          <NavLink to="/tours" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaCompass style={{ marginRight: "10px" }} /> Tours
          </NavLink>
          <NavLink to="/planner" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaTasks style={{ marginRight: "10px" }} /> Travel Planner
          </NavLink>
          <NavLink to="/airport" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaPlane style={{ marginRight: "10px" }} /> Airport Pickup
          </NavLink>
          <NavLink to="/contact" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaEnvelope style={{ marginRight: "10px" }} /> Contact
          </NavLink>
          {user && (user.role === "admin" || user.role === "manager") && (
            <NavLink to="/admin" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
              <FaWrench style={{ marginRight: "10px" }} /> Admin Dashboard
            </NavLink>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
                toggleMobileMenu();
              }}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: "#EF4444",
                fontWeight: "700",
                padding: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* Main Body Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Professional Footer */}
      <footer
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--white)",
          padding: "60px 5% 30px 5%",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <div>
            <h3 style={{ color: "var(--white)", marginBottom: "20px", fontSize: "20px", fontWeight: "800" }}>
              KHAN TOURISM
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "20px" }}>
              Premium customized tours, luxury rent-a-car fleet, and expert guides offering seamless experiences across Skardu, Hunza, Swat, Murree, and other beautiful destinations of Pakistan.
            </p>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/tours" style={{ color: "var(--text-muted)" }} className="footer-link">Featured Tour Packages</Link>
              <Link to="/cars" style={{ color: "var(--text-muted)" }} className="footer-link">Luxury Vehicles Fleet</Link>
              <Link to="/planner" style={{ color: "var(--text-muted)" }} className="footer-link">AI Custom Trip Planner</Link>
              <Link to="/airport" style={{ color: "var(--text-muted)" }} className="footer-link">Airport Pickup Service</Link>
              <Link to="/contact" style={{ color: "var(--text-muted)" }} className="footer-link">Contact & Consultations</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Contact Admins</h4>
            <p style={{ color: "var(--white)", fontWeight: "600", marginBottom: "5px" }}>Abdullah Khan (CEO)</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>📞 +92 336 5004848</p>
            <p style={{ color: "var(--white)", fontWeight: "600", marginBottom: "5px" }}>Waleed Ahmed (Manager)</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>📞 +92 311 5353751</p>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Newsletter</h4>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>
              Subscribe to receive updates on special seasonal packages and tour deals.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToast("Thank you for subscribing to our newsletter!", "success");
                e.target.reset();
              }}
              style={{ display: "flex", gap: "10px" }}
            >
              <input
                type="email"
                placeholder="Your email address"
                required
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  outline: "none",
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 16px" }}>
                Send
              </button>
            </form>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)", margin: "30px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "20px",
            color: "var(--text-muted)",
          }}
        >
          <p>© 2026 Khan Tourism & Guide Pakistan. Licensed Travel Agency & Govt Registered Co.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-link">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-link">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-link">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons Speed Dial */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 99,
        }}
      >
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={handleScrollTop}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "0.3s",
            }}
            title="Scroll to Top"
          >
            <FaChevronUp />
          </button>
        )}

        {/* Callback request button */}
        <button
          onClick={() => setShowCallbackModal(true)}
          style={{
            height: "48px",
            padding: "0 18px",
            borderRadius: "30px",
            backgroundColor: "var(--accent)",
            color: "var(--primary)",
            fontWeight: "700",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "var(--shadow)",
            transition: "0.3s",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          <FaPhone size={12} /> Call Me
        </button>

        {/* Live Call Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCallPopup(!showCallPopup)}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              fontSize: "18px",
            }}
            title="Call Support"
          >
            <FaPhone />
          </button>

          {showCallPopup && (
            <div
              className="card glass"
              style={{
                position: "absolute",
                bottom: "60px",
                right: 0,
                width: "250px",
                padding: "15px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <h5 style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>Select Representative</h5>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
              <a
                href="tel:03365004848"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0,0,0,0.03)",
                  fontSize: "13px",
                }}
                onClick={() => setShowCallPopup(false)}
              >
                <strong>Abdullah Khan</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CEO — 0336-5004848</span>
              </a>
              <a
                href="tel:03115353751"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0,0,0,0.03)",
                  fontSize: "13px",
                }}
                onClick={() => setShowCallPopup(false)}
              >
                <strong>Waleed Ahmed</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manager — 0311-5353751</span>
              </a>
            </div>
          )}
        </div>

        {/* WhatsApp Direct Chat */}
        <a
          href="https://wa.me/923365004848?text=Hello%20Khan%20Tourism,%20I'm%20interested%20in%20booking%20a%20trip/car."
          target="_blank"
          rel="noreferrer"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#22C55E",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
            fontSize: "22px",
            animation: "pulse-glow 2s infinite",
          }}
          title="Chat with Expert"
        >
          <FaWhatsapp />
        </a>
      </div>

      {/* Floating Comparison Drawer Indicator */}
      {(compareCars.length > 0 || compareTours.length > 0) && (
        <div
          className="glass animate-fade-in"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 98,
          }}
        >
          {compareCars.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                🚗 {compareCars.length} Car{compareCars.length > 1 ? "s" : ""} selected
              </span>
              <button
                className="btn btn-primary"
                style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px" }}
                onClick={() => handleOpenCompare("cars")}
              >
                Compare
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: "12px" }}
                onClick={clearCompareCars}
              >
                Clear
              </button>
            </div>
          )}
          {compareCars.length > 0 && compareTours.length > 0 && (
            <div style={{ height: "20px", borderLeft: "1px solid var(--border)" }}></div>
          )}
          {compareTours.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                🗺️ {compareTours.length} Tour{compareTours.length > 1 ? "s" : ""} selected
              </span>
              <button
                className="btn btn-accent"
                style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px" }}
                onClick={() => handleOpenCompare("tours")}
              >
                Compare
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: "12px" }}
                onClick={clearCompareTours}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {showCompareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "850px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "20px",
              padding: "25px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCompareModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaExchangeAlt /> Compare {compareType === "cars" ? "Vehicles" : "Tour Packages"}
            </h3>

            {compareType === "cars" ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="compare-table">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "12px" }}>Specifications</th>
                      {compareCars.map((car, idx) => (
                        <th key={idx} style={{ padding: "12px", color: "var(--secondary)" }}>{car.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Daily Rate</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>Rs. {car.pricePerDay} / day</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Category</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.category || car.model}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Fuel Economy</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.fuelEconomy || "10-14 km/L"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Capacity</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.capacity || "4-5 Persons"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Gear</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.transmission || "Automatic"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: "12px" }}></td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "12px" }}
                            onClick={() => {
                              setShowCompareModal(false);
                              navigate("/cars");
                            }}
                          >
                            Book Now
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="compare-table">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "12px" }}>Features</th>
                      {compareTours.map((tour, idx) => (
                        <th key={idx} style={{ padding: "12px", color: "var(--accent)" }}>{tour.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Duration</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{tour.days || "3-7 Days"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Best Season</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{tour.bestTime || "May - Oct"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Included</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px", fontSize: "12px" }}>
                          {tour.description || "Guided transport & accommodations"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: "12px" }}></td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>
                          <button
                            className="btn btn-accent"
                            style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "12px" }}
                            onClick={() => {
                              setShowCompareModal(false);
                              navigate("/tours");
                            }}
                          >
                            Explore Package
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Callback request modal */}
      {showCallbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCallbackModal(false)}
        >
          <form
            onSubmit={handleRequestCallback}
            className="card"
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "20px",
              padding: "30px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCallbackModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPhone /> Request Callback
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Submit your phone number, and a Khan Tourism expert will call you shortly to discuss your custom travel plan.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Your Name</label>
              <input
                type="text"
                placeholder="Waseem Khan"
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Phone Number</label>
              <input
                type="tel"
                placeholder="03001234567"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Stack-based Toast alerts overlay */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "350px",
          width: "100%",
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";
          const isError = toast.type === "error";

          let icon = <FaInfoCircle style={{ color: "#3B82F6" }} />;
          let accentColor = "#3B82F6";
          if (isSuccess) {
            icon = <FaCheckCircle style={{ color: "#10B981" }} />;
            accentColor = "#10B981";
          } else if (isWarning) {
            icon = <FaExclamationTriangle style={{ color: "#F59E0B" }} />;
            accentColor = "#F59E0B";
          } else if (isError) {
            icon = <FaTimes style={{ color: "#EF4444" }} />;
            accentColor = "#EF4444";
          }

          return (
            <div
              key={toast.id}
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px 20px",
                borderRadius: "12px",
                borderLeft: `4px solid ${accentColor}`,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {icon}
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", flex: 1 }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                }}
              >
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>

      {/* Styled inline helper styles */}
      <style>{`
        .nav-link-item {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }
        .nav-link-item:hover {
          color: var(--secondary) !important;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: 0.2s;
        }
        .mobile-nav-link:hover {
          background: rgba(34, 197, 94, 0.08);
          color: var(--secondary);
        }
        .footer-link {
          transition: 0.2s;
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--secondary) !important;
          padding-left: 3px;
        }
        .compare-table th, .compare-table td {
          border-bottom: 1px solid var(--border);
          padding: 12px;
        }
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-hamburger {
            display: block !important;
          }
          .desktop-nav-profile-name {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
