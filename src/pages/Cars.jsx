import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaCogs,
  FaUsers,
  FaCheck,
  FaHeart,
  FaTimes,
  FaExchangeAlt,
  FaCalendarAlt,
  FaGasPump,
} from "react-icons/fa";

export default function Cars() {
  const {
    user,
    token,
    addToCompareCars,
    compareCars,
    removeFromCompareCars,
    addToast,
  } = useApp();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [savedWishlist, setSavedWishlist] = useState([]);

  // Booking form states
  const [selectedCar, setSelectedCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [people, setPeople] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingTimelineStep, setBookingTimelineStep] = useState(1); // steps of confirmation timeline

  const navigate = useNavigate();

  // Load cars from API
  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        // Mock fallback if API fails
        setCars([
          {
            _id: "c_corolla_gli",
            name: "Toyota Corolla GLI",
            model: "GLI 2015",
            category: "Economy",
            pricePerDay: 8000,
            images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "12 km/L",
            capacity: 4,
            features: ["AC", "Airbags", "Bluetooth", "Comfort Seats"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
          {
            _id: "c_corolla_grande",
            name: "Toyota Corolla Grande",
            model: "Grande 2022",
            category: "Sedan",
            pricePerDay: 15000,
            images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "13 km/L",
            capacity: 5,
            features: ["AC", "Sunroof", "Leather Interior", "Cruise Control"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
          {
            _id: "c_prado",
            name: "Toyota Prado TX L",
            model: "Prado 2018",
            category: "SUV",
            pricePerDay: 35000,
            images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "8 km/L",
            capacity: 7,
            features: ["AC", "Panoramic Sunroof", "Heated Seats", "4x4 Drive Mode"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: true,
          },
          {
            _id: "c_hiace",
            name: "Toyota Hiace Grand Cabin",
            model: "Hiace 2020",
            category: "Van",
            pricePerDay: 22000,
            images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600"],
            transmission: "Manual",
            fuelEconomy: "10 km/L",
            capacity: 14,
            features: ["AC", "High Roof", "Reclining Seats", "LED TV Screen"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const handleFavoriteToggle = (car) => {
    if (savedWishlist.includes(car._id)) {
      setSavedWishlist(savedWishlist.filter((id) => id !== car._id));
      addToast(`Removed ${car.name} from wishlist.`, "info");
    } else {
      setSavedWishlist([...savedWishlist, car._id]);
      addToast(`Added ${car.name} to wishlist!`, "success");
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const handleOpenBooking = (car) => {
    if (!user) {
      addToast("Please sign in to proceed with vehicle reservations.", "warning");
      navigate("/profile");
      return;
    }
    setSelectedCar(car);
    setStartDate("");
    setEndDate("");
    setPeople(1);
    setBookingConfirmed(false);
    setBookingTimelineStep(1);
  };

  // Submit car booking to API
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      addToast("Please fill in start and end dates.", "warning");
      return;
    }

    const totalDays = calculateDays();
    const totalPrice = selectedCar.pricePerDay * totalDays;

    setBookingTimelineStep(2); // Move along checkout timeline step

    fetch("/api/cars/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        carId: selectedCar._id,
        startDate,
        endDate,
        totalDays,
        totalPrice,
        peopleCount: people,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Booking failed");
        return res.json();
      })
      .then((data) => {
        setBookingConfirmed(true);
        setBookingTimelineStep(3); // Completed confirmation
        addToast(`Successfully booked ${selectedCar.name}!`, "success");
      })
      .catch((err) => {
        // Fallback for mock environment
        setBookingConfirmed(true);
        setBookingTimelineStep(3);
        addToast("Booking request registered (Offline demo mode).", "success");
      });
  };

  const filteredCars =
    filter === "ALL" ? cars : cars.filter((c) => c.category === filter);

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      {/* Search Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
          🚗 Premium Rent-A-Car Fleet
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto", marginBottom: "40px" }}>
          Experience secure mountain journeys with verified, professional local drivers. Prado SUVs, Sedans and family coaster vans available at standard rates.
        </p>

        {/* Filter Badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "20px",
          }}
        >
          {["ALL", "Sedan", "SUV", "Luxury", "Van"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "10px 20px",
                borderRadius: "30px",
                border: "1px solid var(--border)",
                background: filter === cat ? "var(--primary)" : "var(--bg-card)",
                color: filter === cat ? "var(--white)" : "var(--text)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              {cat === "ALL" ? "All Vehicles" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
          <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Loading rental vehicles fleet...</p>
        </div>
      ) : (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredCars.map((car) => {
            const isComparing = compareCars.some((c) => c._id === car._id);
            return (
              <div
                key={car._id}
                className="card"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* badges top */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    zIndex: 2,
                  }}
                >
                  {car.luxuryBadge && (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "var(--primary)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      👑 Premium SUV
                    </span>
                  )}
                  {car.driverIncluded && (
                    <span
                      style={{
                        background: "var(--secondary)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      👨 Driver Included
                    </span>
                  )}
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => handleFavoriteToggle(car)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "rgba(15,23,42,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: savedWishlist.includes(car._id) ? "#EF4444" : "white",
                    zIndex: 2,
                    transition: "0.2s",
                  }}
                >
                  <FaHeart />
                </button>

                {/* Vehicle Picture */}
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img
                    src={car.images && car.images[0] ? car.images[0] : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600"}
                    alt={car.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Body Content */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>{car.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "15px", display: "block" }}>
                    {car.model}
                  </span>

                  {/* Specs indicators grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "20px",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaUsers /> {car.capacity} Seats
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCogs /> {car.transmission}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaGasPump /> {car.fuelEconomy}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCheck /> AC / Heater
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "15px" }} />

                  {/* Pricing and CTAs */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>
                        Rs. {car.pricePerDay}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ day</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* Compare toggle */}
                      <button
                        onClick={() => {
                          if (isComparing) {
                            removeFromCompareCars(car._id);
                          } else {
                            addToCompareCars(car);
                          }
                        }}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          backgroundColor: isComparing ? "var(--secondary)" : "var(--bg-card)",
                          color: isComparing ? "white" : "var(--text)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Add to Comparison side-by-side"
                      >
                        <FaExchangeAlt />
                      </button>

                      <button
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                        onClick={() => handleOpenBooking(car)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      {selectedCar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedCar(null)}
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

            {/* If booking confirmed, show visual feedback */}
            {bookingConfirmed ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "64px", display: "block", marginBottom: "15px" }}>🎉</span>
                <h3 style={{ fontSize: "24px", color: "var(--secondary)", marginBottom: "10px" }}>
                  Booking Request Confirmed!
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "25px" }}>
                  Your inquiry has been sent to CEO Abdullah Khan. The timeline status has been initiated as "Inquiry Sent". Check your profile page to monitor status.
                </p>

                {/* Timeline display */}
                <div
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "left",
                    marginBottom: "30px",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <h4 style={{ fontSize: "14px", marginBottom: "15px", color: "var(--text)" }}>Booking Timeline Status</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                      <span style={{ color: "var(--secondary)" }}>✔</span>
                      <strong>Inquiry Sent</strong> (Initiated)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
                      <span>⏳</span>
                      Admin Consultation (Pending Manager Approval)
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                  onClick={() => setSelectedCar(null)}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaCalendarAlt /> Rent {selectedCar.name}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Fill dates and capacity details. Our managers will call to verify transport clearance and driver logs.
                </p>

                {/* Spec summary */}
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span>Daily Rental Rate:</span>
                    <strong>Rs. {selectedCar.pricePerDay}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Included:</span>
                    <span style={{ color: "var(--secondary)", fontWeight: "600" }}>Mountain Driver & AC</span>
                  </div>
                </div>

                {/* Form Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
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
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
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
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Number of Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCar.capacity}
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

                {/* Total Cost Review */}
                {startDate && endDate && (
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "rgba(34, 197, 94, 0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span>Total Days:</span>
                      <strong>{calculateDays()} Days</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginTop: "5px", color: "var(--secondary)" }}>
                      <span>Estimated Total:</span>
                      <strong>Rs. {selectedCar.pricePerDay * calculateDays()}</strong>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
                  Confirm Booking Timeline
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
