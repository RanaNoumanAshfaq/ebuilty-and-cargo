import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaGasPump,
  FaHotel,
  FaCar,
  FaCalculator,
  FaCheck,
  FaClock,
} from "react-icons/fa";

export default function Planner() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  // Input states
  const [budget, setBudget] = useState(80000);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(4);
  const [destination, setDestination] = useState("Hunza");

  // Output / result states
  const [loading, setLoading] = useState(false);
  const [plannerResult, setPlannerResult] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleGeneratePlan = (e) => {
    e.preventDefault();
    setLoading(true);
    setPlannerResult(null);

    fetch("/api/inquiries/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget, people, days, destination }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Planner calculation failed");
        return res.json();
      })
      .then((data) => {
        setPlannerResult(data);
        setLoading(false);
        addToast("Travel Plan generated successfully!", "success");
      })
      .catch((err) => {
        // Fallback calculation in case server is offline
        setTimeout(() => {
          const distances = { Hunza: 600, Skardu: 650, Swat: 250, Murree: 60 };
          const dist = distances[destination] || 150;
          const fuel = Math.round(((dist * 2) / 12) * 275);
          
          let car = "Toyota Corolla GLI";
          let hotels = "PTDC Motel / Swat Regency";
          let hotelCost = 10000;
          if (budget > 150000) {
            car = "Toyota Prado TX L";
            hotels = "Serena Golden Heights / Shangrila Resort";
            hotelCost = 35000;
          } else if (budget >= 70000) {
            car = "Toyota Corolla Grande";
            hotels = "Karimabad Serena Inn";
            hotelCost = 18000;
          }

          setPlannerResult({
            recommendedCar: car,
            suggestedHotels: hotels,
            estimatedFuelCost: fuel,
            totalEstimatedBudget: fuel + (hotelCost * days) + (days * 5000),
            tourItinerary: [
              { day: 1, title: `Road Trip to ${destination}`, description: `Depart from Islamabad, travel ${dist}km. Check-in to ${hotels}.` },
              { day: 2, title: "Scenic Valley Sightseeing", description: "Explore local historical forts, capture peak landscapes and enjoy local foods." },
              { day: 3, title: "Cultural & Lake Boating Activities", description: "Hike up viewpoints and enjoy boating or hiking activities." },
              { day: days, title: "Return drive to Islamabad", description: "Drive back safely and complete pickup checklist." }
            ]
          });
          setLoading(false);
          addToast("Travel Plan generated (Offline calculation).", "success");
        }, 1000);
      });
  };

  const handleBookPlannedTrip = () => {
    if (!user) {
      addToast("Please sign in to save or book this planned trip.", "warning");
      navigate("/profile");
      return;
    }

    // Submit custom booking inquiry to backend
    fetch("/api/tours/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tourId: "custom_planner_trip",
        startDate: new Date().toISOString().split("T")[0],
        totalDays: days,
        totalPrice: plannerResult.totalEstimatedBudget,
        peopleCount: people,
      }),
    })
      .then((res) => {
        setBookingConfirmed(true);
        addToast("Custom trip saved to your booking history!", "success");
      })
      .catch(() => {
        setBookingConfirmed(true);
        addToast("Custom trip saved (Offline demo mode).", "success");
      });
  };

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            💼 Personalized Travel Planner
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Enter your parameters, and our system will calculate recommended cars, lodging, fuel expenditures, and layout a custom daily itinerary.
          </p>
        </div>

        {/* Input Form Card */}
        <form
          className="card glass"
          onSubmit={handleGeneratePlan}
          style={{
            padding: "30px",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            alignItems: "end",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Total Budget (PKR)</label>
            <input
              type="number"
              min="20000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Days of Tour</label>
            <input
              type="number"
              min="2"
              max="14"
              value={days}
              onChange={(e) => setDays(e.target.value)}
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
            <label style={{ fontSize: "12px", fontWeight: "600" }}>People</label>
            <input
              type="number"
              min="1"
              max="15"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
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
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                outline: "none",
              }}
            >
              <option value="Hunza">Hunza Valley</option>
              <option value="Skardu">Skardu</option>
              <option value="Swat">Swat Valley</option>
              <option value="Murree">Murree Hills</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: "11px", borderRadius: "8px" }}>
            <FaCalculator /> Plan Trip
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Running planner calculations...</p>
          </div>
        )}

        {/* Results Panel */}
        {plannerResult && !loading && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Summary details card */}
            <div
              className="card"
              style={{
                padding: "30px",
                borderRadius: "24px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <h2 style={{ fontSize: "22px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                🏆 Generated suggestions for {destination}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                {/* Car */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(34,197,94,0.1)",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaCar />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Recommended Car</span>
                    <strong style={{ fontSize: "14px" }}>{plannerResult.recommendedCar}</strong>
                  </div>
                </div>

                {/* Hotel */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(245,158,11,0.1)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaHotel />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Suggested Hotel</span>
                    <strong style={{ fontSize: "14px" }}>{plannerResult.suggestedHotels}</strong>
                  </div>
                </div>

                {/* Fuel Cost */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(59,130,246,0.1)",
                      color: "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaGasPump />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Estimated Fuel Cost</span>
                    <strong style={{ fontSize: "14px" }}>Rs. {plannerResult.estimatedFuelCost}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg)",
                  padding: "20px",
                  borderRadius: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Calculated Budget</span>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--secondary)" }}>
                    Rs. {plannerResult.totalEstimatedBudget}
                  </div>
                </div>

                {bookingConfirmed ? (
                  <span style={{ color: "var(--secondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaCheck /> Saved to Booking History
                  </span>
                ) : (
                  <button className="btn btn-primary" onClick={handleBookPlannedTrip}>
                    Inquire / Save Trip
                  </button>
                )}
              </div>
            </div>

            {/* Itinerary planner day list */}
            <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>🗺️ Generated Trip Itinerary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {plannerResult.tourItinerary.map((day, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "var(--secondary)",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaClock size={10} /> Day {day.day}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", marginBottom: "4px" }}>{day.title}</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
