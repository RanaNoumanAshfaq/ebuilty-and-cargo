import React, { useState, useEffect } from "react";
import {
  FaPlaneDeparture,
  FaUserAlt,
  FaCar,
  FaPhoneAlt,
  FaClock,
  FaMapMarked,
  FaSearch,
} from "react-icons/fa";

export default function Airport() {
  const [flightNo, setFlightNo] = useState("PK785");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(35);
  const [activeTab, setActiveTab] = useState("tracker");

  // Simulated countdown interval
  useEffect(() => {
    if (!trackingData) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 35));
    }, 60000);
    return () => clearInterval(timer);
  }, [trackingData]);

  const handleTrackFlight = (e) => {
    e.preventDefault();
    if (!flightNo) return;
    setLoading(true);
    setTrackingData(null);

    fetch("/api/airport/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightNumber: flightNo }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTrackingData(data);
        setCountdown(data.estimatedArrivalMins || 35);
        setLoading(false);
      })
      .catch(() => {
        // Fallback mock details if API offline
        setTimeout(() => {
          setTrackingData({
            driverName: "Zahid Mahmood",
            driverPhone: "+92 334 1122334",
            driverPhoto: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150",
            vehicleName: "Toyota Corolla Grande 2022",
            vehiclePhoto: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=300",
            driverVehicleNo: "LE-482-ICT",
            livePickupStatus: "Driver En-Route to Islamabad Airport",
            estimatedArrivalMins: 35,
            flightTracked: flightNo.toUpperCase(),
          });
          setLoading(false);
        }, 800);
      });
  };

  const steps = [
    { label: "Flight Landed", active: true },
    { label: "Luggage Pickup", active: true },
    { label: "Driver En-Route", active: true },
    { label: "Driver Waiting", active: false },
    { label: "Enjoying Ride", active: false },
  ];

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            🛫 Airport Pickup Tracker
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Track international or domestic arrival flights. Our system simulates live driver status and terminal locations.
          </p>
        </div>

        {/* Input Form card */}
        <form
          onSubmit={handleTrackFlight}
          className="card glass"
          style={{
            padding: "20px 25px",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <FaPlaneDeparture style={{ fontSize: "20px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Enter Flight Number (e.g. PK785)"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              fontSize: "15px",
              fontWeight: "600",
              outline: "none",
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px" }}>
            <FaSearch /> Track Flight
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Scanning flight coordinates...</p>
          </div>
        )}

        {/* Details Display Panel */}
        {trackingData && !loading && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "15px" }}>
              <button
                onClick={() => setActiveTab("tracker")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === "tracker" ? "var(--secondary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderBottom: activeTab === "tracker" ? "2px solid var(--secondary)" : "2px solid transparent",
                  paddingBottom: "8px",
                }}
              >
                📟 Live Status
              </button>
              <button
                onClick={() => setActiveTab("map")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === "map" ? "var(--secondary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderBottom: activeTab === "map" ? "2px solid var(--secondary)" : "2px solid transparent",
                  paddingBottom: "8px",
                }}
              >
                🗺️ Terminal Map
              </button>
            </div>

            {activeTab === "tracker" ? (
              <>
                {/* Live timeline status progress bar */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Live Pickup Timeline</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "relative",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* Line connection */}
                    <div
                      style={{
                        position: "absolute",
                        left: "10px",
                        right: "10px",
                        top: "12px",
                        height: "3px",
                        backgroundColor: "var(--border)",
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "10px",
                        width: "50%",
                        top: "12px",
                        height: "3px",
                        backgroundColor: "var(--secondary)",
                        zIndex: 1,
                      }}
                    />

                    {steps.map((st, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 2,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: st.active ? "var(--secondary)" : "var(--bg-card)",
                            border: `3px solid ${st.active ? "var(--secondary)" : "var(--border)"}`,
                          }}
                        />
                        <span style={{ fontSize: "10px", fontWeight: "600", marginTop: "8px", textAlign: "center", color: st.active ? "var(--text)" : "var(--text-muted)" }}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver information card */}
                <div
                  className="card"
                  style={{
                    padding: "30px",
                    borderRadius: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "30px",
                    alignItems: "center",
                  }}
                >
                  {/* Photo details */}
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <img
                      src={trackingData.driverPhoto}
                      alt="Driver"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid var(--secondary)",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Assigned Chauffeur</div>
                      <h3 style={{ fontSize: "18px", margin: "2px 0" }}>{trackingData.driverName}</h3>
                      <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "700" }}>⭐ 4.9 Driver Rating</span>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Pickup Vehicle</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", margin: "2px 0" }}>{trackingData.vehicleName}</div>
                    <span
                      style={{
                        display: "inline-block",
                        background: "var(--primary)",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "800",
                      }}
                    >
                      {trackingData.driverVehicleNo}
                    </span>
                  </div>

                  {/* Contact timer */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                      <FaClock style={{ color: "var(--secondary)" }} />
                      <strong>Arrival in {countdown} mins</strong>
                    </div>
                    <a
                      href={`tel:${trackingData.driverPhone}`}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                    >
                      <FaPhoneAlt size={11} /> Call Zahid
                    </a>
                  </div>
                </div>
              </>
            ) : (
              /* Terminal Map blueprint simulation */
              <div
                className="card"
                style={{
                  padding: "30px",
                  borderRadius: "24px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Islamabad International Airport (ISB)</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Assigned meeting spot: **International Arrivals Exit Gate #3** (Next to PTDC Information desk).
                </p>

                {/* Map simulation */}
                <div
                  style={{
                    height: "300px",
                    backgroundColor: "var(--bg)",
                    border: "2px dashed var(--border)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <FaMapMarked style={{ fontSize: "48px", color: "var(--text-muted)" }} />
                  <div
                    style={{
                      position: "absolute",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "rgba(34,197,94,0.15)",
                      color: "var(--secondary)",
                      border: "1px solid var(--secondary)",
                      fontSize: "12px",
                      fontWeight: "700",
                      top: "40%",
                      left: "35%",
                    }}
                  >
                    📍 Driver Zahid Waiting Point (Gate 3)
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      border: "1px solid #EF4444",
                      fontSize: "11px",
                      fontWeight: "700",
                      top: "20%",
                      left: "20%",
                    }}
                  >
                    🛫 Landing Runway
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}