import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCompass,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaTimes,
  FaExchangeAlt,
  FaCloudSun,
  FaRoute,
  FaPrint,
  FaInfoCircle,
} from "react-icons/fa";

export default function Tours() {
  const {
    user,
    token,
    addToCompareTours,
    compareTours,
    removeFromCompareTours,
    addToast,
  } = useApp();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Modal Details state
  const [activeTourDetails, setActiveTourDetails] = useState(null);

  // Booking states
  const [selectedTour, setSelectedTour] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [people, setPeople] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Currency Converter Widget states
  const [pkrAmount, setPkrAmount] = useState(100000);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [convertedVal, setConvertedVal] = useState(0);

  const navigate = useNavigate();

  // Exchange rates mock
  const RATES = {
    USD: 0.0036, // 1 PKR = 0.0036 USD (roughly 278 PKR/USD)
    EUR: 0.0033,
    GBP: 0.0028,
    JPY: 0.57,
  };

  useEffect(() => {
    // Run initial conversion
    setConvertedVal(Math.round(pkrAmount * RATES[currencyCode] * 100) / 100);
  }, [pkrAmount, currencyCode]);

  // Fetch tour packages from Express
  useEffect(() => {
    fetch("/api/tours")
      .then((res) => res.json())
      .then((data) => {
        setTours(data);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback mock tours data
        setTours([
          {
            _id: "t_hunza",
            name: "Hunza Valley Autumn Luxury Tour",
            days: "5 Days / 4 Nights",
            price: 95000,
            image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000",
            category: "Adventure",
            description: "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
            highlights: ["Attabad Lake Boating", "Altit & Baltit Fort tours", "Passu Cones Sightseeing", "Khunjerab Pass (China Border)"],
            itinerary: [
              { day: 1, title: "Departure from Islamabad", description: "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent." },
              { day: 2, title: "Journey to Karimabad (Hunza)", description: "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar." },
              { day: 3, title: "Altit Fort & Attabad Lake", description: "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake." },
              { day: 4, title: "Passu Cones & China Border", description: "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)." },
              { day: 5, title: "Return Voyage to Islamabad", description: "Drive back to Islamabad with memories of beautiful valleys." }
            ],
            bestTime: "September to November",
            activities: ["Sightseeing", "Boating", "Photography", "Cultural Tours"],
            weatherInfo: "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
            packingChecklist: ["Heavy jacket", "Gloves", "Thermal wear", "Hiking boots", "Sunglasses"]
          },
          {
            _id: "t_skardu",
            name: "Skardu Majestic Peaks Tour",
            days: "7 Days / 6 Nights",
            price: 135000,
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
            category: "Adventure",
            description: "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
            highlights: ["Shangrila Resort visit", "Upper Kachura Lake boating", "Katpana Cold Desert Safari", "Deosai Plains expedition"],
            itinerary: [
              { day: 1, title: "Fly to Skardu or road travel", description: "Arrive at Skardu, check-in to hotel and relax." },
              { day: 2, title: "Shangrila & Kachura Lakes", description: "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake." },
              { day: 3, title: "Shigar Valley Fort", description: "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine." },
              { day: 4, title: "Deosai National Park", description: "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears." },
              { day: 5, title: "Katpana Sand Dunes", description: "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking." },
              { day: 6, title: "Manthoka Waterfall", description: "Drive to Manthoka and enjoy a local picnic lunch." },
              { day: 7, title: "Departure", description: "Flight back or road departure to Islamabad." }
            ],
            bestTime: "June to September",
            activities: ["Jeep Safari", "Trekking", "Camping", "Lakeside Boating"],
            weatherInfo: "Sunny days (20°C) with cold winds. Very pleasant summers.",
            packingChecklist: ["Windcheater jacket", "Hiking poles", "Sunblock cream", "Light woolens"]
          },
          {
            _id: "t_swat",
            name: "Swat Valley & Kalam Family Retreat",
            days: "4 Days / 3 Nights",
            price: 65000,
            image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000",
            category: "Family",
            description: "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
            highlights: ["Malam Jabba Ski Resort", "Fizagat Park riverfront", "Kalam Forest walk", "Ushu Forest safari"],
            itinerary: [
              { day: 1, title: "Drive to Mingora (Swat)", description: "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk." },
              { day: 2, title: "Malam Jabba Day Tour", description: "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba." },
              { day: 3, title: "Kalam Forest Expedition", description: "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake." },
              { day: 4, title: "Return Drive", description: "Explore local handicrafts bazaar and drive back to Islamabad." }
            ],
            bestTime: "April to October",
            activities: ["Chairlift", "Zipline", "River rafting", "Meadow walks"],
            weatherInfo: "Temperate summers around 24°C. Very pleasant weather.",
            packingChecklist: ["Light jacket", "Comfortable sneakers", "Umbrella", "Personal medicine kit"]
          }
        ]);
        setLoading(false);
      });
  }, []);

  const handleOpenBooking = (tour) => {
    if (!user) {
      addToast("Please login to proceed with booking inquiries.", "warning");
      navigate("/profile");
      return;
    }
    setSelectedTour(tour);
    setStartDate("");
    setPeople(1);
    setBookingConfirmed(false);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!startDate) {
      addToast("Please select a tour start date.", "warning");
      return;
    }

    fetch("/api/tours/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tourId: selectedTour._id,
        startDate,
        totalDays: selectedTour.days.split(" ")[0] || 5,
        totalPrice: selectedTour.price * people,
        peopleCount: people,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Booking failed");
        return res.json();
      })
      .then((data) => {
        setBookingConfirmed(true);
        addToast(`Successfully booked inquiry for ${selectedTour.name}!`, "success");
      })
      .catch((err) => {
        // Fallback for offline demo
        setBookingConfirmed(true);
        addToast("Tour inquiry registered successfully (Offline mode).", "success");
      });
  };

  // Printable print view trigger
  const handlePrintItinerary = (tour) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${tour.name} Itinerary - Khan Tourism</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
            h2 { color: #0f172a; margin-top: 30px; }
            .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            .day-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .day-title { font-weight: bold; color: #22c55e; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${tour.name}</h1>
          <div class="meta">
            <p><strong>Duration:</strong> ${tour.days}</p>
            <p><strong>Best Time:</strong> ${tour.bestTime}</p>
            <p><strong>Estimated Pricing:</strong> Rs. ${tour.price} Base Package</p>
          </div>
          <p>${tour.description}</p>
          
          <h2>Detailed Day-by-Day Itinerary</h2>
          ${tour.itinerary.map(
            (day) => `
            <div class="day-card">
              <div class="day-title">Day ${day.day} - ${day.title}</div>
              <p>${day.description}</p>
            </div>
          `
          ).join("")}

          <h2>Recommended Packing Checklist</h2>
          <ul>
            ${tour.packingChecklist.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            © 2026 Khan Tourism & Guide Pakistan. All rights reserved.
          </p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtering + Searching logic
  const filteredTours = tours.filter((t) => {
    const matchesFilter = filter === "ALL" || t.category === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            🗺️ Pakistan Tour Packages
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Handpicked customized itineraries with private transport, safety guides and luxury stays across Hunza, Skardu, and Kalam.
          </p>
        </div>

        {/* Smart widgets side-by-side panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Currency Converter widget */}
          <div className="card glass" style={{ padding: "20px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>💱 Currency Converter (For Guests)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  value={pkrAmount}
                  onChange={(e) => setPkrAmount(e.target.value)}
                  placeholder="Amount in PKR"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                Rs. {pkrAmount} PKR = {convertedVal} {currencyCode}
              </div>
            </div>
          </div>

          {/* Quick Distance lookup widget */}
          <div className="card glass" style={{ padding: "20px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>🚗 Northern Track Difficulty</h3>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>📍 <strong>Islamabad to Murree:</strong> 60 km (1.5 hours, Easy Asphalt)</div>
              <div>📍 <strong>Islamabad to Swat:</strong> 250 km (3.5 hours, Expressway, Moderate)</div>
              <div>📍 <strong>Islamabad to Hunza:</strong> 600 km (12 hours, Karakoram Highway, Hard)</div>
              <div>📍 <strong>Islamabad to Skardu:</strong> 650 km (13 hours, Jaglot Mountain Road, Extreme)</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "20px",
          }}
        >
          {/* Categories */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["ALL", "Adventure", "Family", "Honeymoon"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  background: filter === cat ? "var(--secondary)" : "var(--bg-card)",
                  color: filter === cat ? "var(--white)" : "var(--text)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Filter tours by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "30px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              width: "250px",
              outline: "none",
            }}
          />
        </div>

        {/* Directory Grid */}
        {filteredTours.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
            No tour packages found matching your criteria.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredTours.map((tour) => {
              const isComparing = compareTours.some((t) => t._id === tour._id);
              return (
                <div
                  key={tour._id}
                  className="card"
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", height: "230px" }}>
                    <img
                      src={tour.image}
                      alt={tour.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "15px",
                        left: "15px",
                        backgroundColor: "var(--primary)",
                        color: "white",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {tour.days}
                    </div>
                  </div>

                  <div style={{ padding: "25px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: "19px", marginBottom: "10px" }}>{tour.name}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                      {tour.description.substring(0, 120)}...
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimated Package</div>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>
                          Rs. {tour.price}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Compare toggle */}
                        <button
                          onClick={() => {
                            if (isComparing) {
                              removeFromCompareTours(tour._id);
                            } else {
                              addToCompareTours(tour);
                            }
                          }}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            backgroundColor: isComparing ? "var(--accent)" : "var(--bg-card)",
                            color: isComparing ? "var(--primary)" : "var(--text)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Compare side-by-side"
                        >
                          <FaExchangeAlt />
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                          onClick={() => setActiveTourDetails(tour)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tour Detail Modal Dialog overlay */}
      {activeTourDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
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
              maxWidth: "700px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setActiveTourDetails(null)}
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

            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>{activeTourDetails.name}</h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              <span>⏱️ <strong>Duration:</strong> {activeTourDetails.days}</span>
              <span>📅 <strong>Best season:</strong> {activeTourDetails.bestTime}</span>
              <span>💰 <strong>Package price:</strong> Rs. {activeTourDetails.price}</span>
            </div>

            <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "25px" }}>
              {activeTourDetails.description}
            </p>

            {/* highlights box */}
            <div
              style={{
                backgroundColor: "var(--bg)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                border: "1px solid var(--border)",
              }}
            >
              <h4 style={{ fontSize: "14px", marginBottom: "10px", color: "var(--text)" }}>✨ Key Highlights</h4>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.8" }}>
                {activeTourDetails.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            {/* Timeline Day-by-Day itinerary */}
            <h4 style={{ fontSize: "15px", marginBottom: "15px" }}>📅 Daily Tour Itinerary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              {activeTourDetails.itinerary.map((day) => (
                <div key={day.day} style={{ display: "flex", gap: "15px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--secondary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    D{day.day}
                  </div>
                  <div>
                    <h5 style={{ fontSize: "14px", color: "var(--text)" }}>{day.title}</h5>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{day.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart checklists panel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div>
                <h5 style={{ fontSize: "14px", marginBottom: "8px" }}>🎒 Packing Checklist</h5>
                <ul style={{ fontSize: "12px", paddingLeft: "15px", color: "var(--text-muted)" }}>
                  {activeTourDetails.packingChecklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 style={{ fontSize: "14px", marginBottom: "8px" }}><FaCloudSun /> Weather Warning</h5>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {activeTourDetails.weatherInfo || "Weather averages around 15°C. Check forecasting before travel."}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => handlePrintItinerary(activeTourDetails)}
              >
                <FaPrint /> Print / Save PDF
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setActiveTourDetails(null);
                  handleOpenBooking(activeTourDetails);
                }}
              >
                Book This Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal dialog */}
      {selectedTour && (
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
              maxWidth: "450px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedTour(null)}
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

            {bookingConfirmed ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ fontSize: "56px", display: "block", marginBottom: "15px" }}>📅</span>
                <h3 style={{ fontSize: "22px", color: "var(--secondary)", marginBottom: "10px" }}>
                  Tour Booking Initiated!
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "25px" }}>
                  Your tour package inquiry has been logged. Our booking representatives will contact you shortly to confirm hotel allocations and travel dates.
                </p>
                <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedTour(null)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "18px" }}>Book {selectedTour.name}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Timeline status will initiate as "Inquiry Sent" under your user profile.
                </p>

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
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Number of People</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
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

                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Estimated Cost:</span>
                    <strong>Rs. {selectedTour.price * people}</strong>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Reservation Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}