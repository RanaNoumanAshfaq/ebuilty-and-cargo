import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaKey,
  FaFileInvoice,
  FaUpload,
  FaAddressCard,
  FaHistory,
  FaHeart,
  FaEdit,
  FaCheckCircle,
  FaTimes,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Profile() {
  const {
    user,
    token,
    login,
    updateProfile,
    addToast,
    compareCars,
    compareTours,
  } = useApp();

  const navigate = useNavigate();

  // Auth form states
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");

  // Edit profile states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // Verification document upload states
  const [cnicNo, setCnicNo] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Active bookings list
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Load user profile details on mount
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAvatar(user.avatar || "");
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = () => {
    // In production, we'd fetch user specific bookings. We will call admin bookings and filter for demo, or mock
    fetch("/api/admin/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filter bookings for current logged-in user
        const myBookings = data.filter(
          (b) => b.user === user.id || b.user?._id === user.id || b.user === "u_test"
        );
        setBookings(myBookings);
        setBookingsLoading(false);
      })
      .catch(() => {
        // Mock fallback
        setBookings([
          {
            _id: "b_01",
            type: "Car",
            itemName: "Toyota Corolla Grande 2022",
            startDate: "2026-07-10",
            endDate: "2026-07-15",
            totalDays: 5,
            totalPrice: 75000,
            timelineStatus: "Booking Confirmed",
            details: {
              peopleCount: 4,
              driverName: "Karamat Shah",
              driverPhone: "0301-7654321",
              driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
              driverVehicleNo: "ICT-LE-392",
            },
          },
          {
            _id: "b_02",
            type: "Tour",
            itemName: "Hunza Valley Autumn Luxury Tour",
            startDate: "2026-09-12",
            totalDays: 5,
            totalPrice: 95000,
            timelineStatus: "Quotation Sent",
            details: { peopleCount: 2 },
          },
        ]);
        setBookingsLoading(false);
      });
  };

  // Sign In / Register submission handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      addToast("Please enter email and password.", "warning");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const bodyData = isLogin
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, phone: authPhone };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || "Authentication failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        login(data.user, data.token);
      })
      .catch((err) => {
        // Offline test fallback
        if (isLogin) {
          if (authEmail === "admin@khantourism.com" && authPassword === "admin123") {
            login(
              { id: "u_admin", name: "Abdullah Khan", email: "admin@khantourism.com", role: "admin", verificationStatus: "verified" },
              "mock_admin_token"
            );
          } else if (authEmail === "user@gmail.com" && authPassword === "user123") {
            login(
              { id: "u_test", name: "Rana Nouman", email: "user@gmail.com", role: "user", verificationStatus: "verified" },
              "mock_user_token"
            );
          } else {
            addToast("Invalid email or password (Offline check).", "error");
          }
        } else {
          // Register mock
          login(
            { id: `u_${Date.now()}`, name: authName, email: authEmail, role: "user", verificationStatus: "none" },
            "mock_registered_token"
          );
        }
      });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, phone: editPhone, avatar: editAvatar }),
    })
      .then((res) => res.json())
      .then((data) => {
        updateProfile(data.user);
        addToast("Profile details updated successfully!", "success");
      })
      .catch(() => {
        // Offline mock update
        updateProfile({ ...user, name: editName, phone: editPhone, avatar: editAvatar });
        addToast("Profile updated (Local session).", "success");
      });
  };

  const handleDocumentUpload = (e) => {
    e.preventDefault();
    if (!cnicNo && !passportNo) {
      addToast("Please fill in CNIC or Passport details.", "warning");
      return;
    }
    setUploadLoading(true);

    fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cnic: cnicNo, passport: passportNo }),
    })
      .then((res) => res.json())
      .then((data) => {
        updateProfile(data.user);
        setUploadLoading(false);
        addToast("Verification documents uploaded successfully. Pending Admin review.", "success");
      })
      .catch(() => {
        setTimeout(() => {
          updateProfile({ ...user, verificationStatus: "pending" });
          setUploadLoading(false);
          addToast("Verification pending (Offline demo).", "success");
        }, 1000);
      });
  };

  // printable invoice generator
  const handlePrintInvoice = (booking) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Khan Tourism</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            h1 { color: #0f172a; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; color: #22c55e; margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <h1>KHAN TOURISM & GUIDE</h1>
            <p><strong>Invoice ID:</strong> INV-${booking._id}</p>
            <p><strong>Customer Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Booking Type:</strong> ${booking.type}</p>
            <p><strong>Reserved Item:</strong> ${booking.itemName}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Dates / Quantity</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.itemName} (${booking.type} Rental)</td>
                  <td>Starts: ${booking.startDate} (${booking.totalDays} Days)</td>
                  <td>Rs. ${booking.totalPrice} PKR</td>
                </tr>
              </tbody>
            </table>
            <div class="total">Grand Total: Rs. ${booking.totalPrice} PKR</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Timeline tracking list
  const TIMELINE_STEPS = [
    "Inquiry Sent",
    "Admin Consultation",
    "Vehicle Suggested",
    "Quotation Sent",
    "Verification",
    "Payment",
    "Booking Confirmed",
    "Enjoy Your Trip",
  ];

  if (!user) {
    return (
      <div
        style={{
          padding: "120px 20px 50px 20px",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "450px",
            padding: "40px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: "800" }}>
              {isLogin ? "Sign In Portal" : "Create Account"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "5px" }}>
              {isLogin ? "Access booking timelines & invoice PDF downloads." : "Register to upload CNIC and reserve luxury guides."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Zain Ali"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
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
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Email Address</label>
              <input
                type="email"
                placeholder="user@gmail.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
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

            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Contact Number</label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
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
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
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
              {isLogin ? "Log In" : "Register"}
            </button>
          </form>

          {/* Quick Mock Accounts hints */}
          {isLogin && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                backgroundColor: "var(--bg)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <div>💡 <strong>Demo User:</strong> user@gmail.com / user123</div>
              <div style={{ marginTop: "4px" }}>💡 <strong>Demo Admin:</strong> admin@khantourism.com / admin123</div>
            </div>
          )}

          <div style={{ marginTop: "25px", textAlign: "center", fontSize: "13px" }}>
            <span style={{ color: "var(--text-muted)" }}>
              {isLogin ? "Don't have an account?" : "Already registered?"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "var(--secondary)",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {isLogin ? "Create One" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 2.5fr",
          gap: "40px",
        }}
        className="profile-layout"
      >
        {/* Left Side: Profile & Verification cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* User Details display */}
          <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  overflow: "hidden",
                  border: "3px solid var(--border)",
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <h3 style={{ fontSize: "18px" }}>{user.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{user.email}</p>

              {/* verification status badge */}
              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  backgroundColor:
                    user.verificationStatus === "verified"
                      ? "rgba(34, 197, 94, 0.15)"
                      : user.verificationStatus === "pending"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(100, 116, 139, 0.15)",
                  color:
                    user.verificationStatus === "verified"
                      ? "var(--secondary)"
                      : user.verificationStatus === "pending"
                      ? "var(--accent)"
                      : "var(--text-muted)",
                }}
              >
                Verification: {user.verificationStatus || "none"}
              </span>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Avatar URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://image-link"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ padding: "8px", fontSize: "12px", borderRadius: "6px" }}>
                <FaEdit size={10} /> Update Profile
              </button>
            </form>
          </div>

          {/* Verification documents upload card */}
          {user.verificationStatus !== "verified" && (
            <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaAddressCard style={{ color: "var(--accent)" }} /> Verify Identity
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "15px" }}>
                Provide CNIC or Passport details to unlock self-drive permissions and government NOC tourist permits.
              </p>

              <form onSubmit={handleDocumentUpload} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>CNIC Number (National Identity)</label>
                  <input
                    type="text"
                    placeholder="37405-1234567-1"
                    value={cnicNo}
                    onChange={(e) => setCnicNo(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "13px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>Passport Number (Foreigners)</label>
                  <input
                    type="text"
                    placeholder="AB1234567"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Mock File selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>Upload Scanned Document Page</label>
                  <div
                    style={{
                      border: "1px dashed var(--border)",
                      borderRadius: "6px",
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "var(--bg)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    onClick={() => addToast("Scanned document selected.", "info")}
                  >
                    <FaUpload /> Choose CNIC/Passport photo
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px", fontSize: "12px", borderRadius: "6px" }}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Submitting..." : "Submit Documents"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Active bookings list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Active Bookings list */}
          <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaHistory /> Active Travel Bookings
            </h2>

            {bookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>You do not have any active travel reservations.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {bookings.map((booking) => {
                  const currentStatusIdx = TIMELINE_STEPS.indexOf(booking.timelineStatus);

                  return (
                    <div
                      key={booking._id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                        padding: "20px",
                        backgroundColor: "var(--bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: booking.type === "Car" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                              color: booking.type === "Car" ? "var(--secondary)" : "var(--accent)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              marginRight: "8px",
                            }}
                          >
                            {booking.type}
                          </span>
                          <strong style={{ fontSize: "15px" }}>{booking.itemName}</strong>
                        </div>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "11px" }}
                          onClick={() => handlePrintInvoice(booking)}
                        >
                          <FaFileInvoice /> Invoice PDF
                        </button>
                      </div>

                      {/* Timeline graphic bar */}
                      <div style={{ margin: "25px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                          <div style={{ position: "absolute", left: "5px", right: "5px", height: "3px", backgroundColor: "var(--border)", zIndex: 1 }} />
                          {TIMELINE_STEPS.map((step, idx) => {
                            const isPassed = idx <= currentStatusIdx;
                            const isCurrent = idx === currentStatusIdx;

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  zIndex: 2,
                                }}
                                title={step}
                              >
                                <div
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    backgroundColor: isPassed ? (isCurrent ? "var(--accent)" : "var(--secondary)") : "var(--border)",
                                    border: isCurrent ? "2px solid white" : "none",
                                    transform: isCurrent ? "scale(1.3)" : "none",
                                    transition: "0.3s",
                                  }}
                                />
                                <span style={{ display: "none" }}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", marginTop: "8px" }}>
                          <span>Inquiry Sent</span>
                          <span style={{ color: "var(--accent)", fontWeight: "700" }}>Active: {booking.timelineStatus}</span>
                          <span>Enjoy Trip</span>
                        </div>
                      </div>

                      {/* Driver details if type = Car and driver assigned */}
                      {booking.type === "Car" && booking.details?.driverName && (
                        <div
                          style={{
                            display: "flex",
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "12px",
                            padding: "12px",
                            alignItems: "center",
                            gap: "15px",
                            marginTop: "15px",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <img
                            src={booking.details.driverPhoto}
                            alt="Driver"
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div style={{ flex: 1, fontSize: "12px" }}>
                            <strong>{booking.details.driverName}</strong> (Driver)
                            <div style={{ color: "var(--text-muted)" }}>📞 {booking.details.driverPhone} | 🚗 {booking.details.driverVehicleNo}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
