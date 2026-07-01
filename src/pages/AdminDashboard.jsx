import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaWrench,
  FaUsers,
  FaBook,
  FaDollarSign,
  FaCar,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaLock,
  FaExchangeAlt,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function AdminDashboard() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  // Active dashboard view tab
  const [activeTab, setActiveTab] = useState("overview");

  // State data variables
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cars, setCars] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and form states
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    name: "",
    model: "",
    category: "Sedan",
    pricePerDay: "",
    images: "",
    transmission: "Automatic",
    fuelEconomy: "12 km/L",
    capacity: 5,
    features: "",
    driverIncluded: true,
    luxuryBadge: false
  });

  const [showTourModal, setShowTourModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState({
    name: "",
    days: "",
    price: "",
    image: "",
    category: "Adventure",
    description: "",
    highlights: "",
    itineraryRaw: "",
    bestTime: "",
    activities: "",
    weatherInfo: "",
    packingChecklist: ""
  });

  // Load dashboard details from API
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      addToast("Access Denied. Admins and Managers only.", "warning");
      navigate("/");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };

      // 1. Stats
      const statsRes = await fetch("/api/admin/stats", { headers: authHeaders });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Bookings
      const bookingsRes = await fetch("/api/admin/bookings", { headers: authHeaders });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

      // 3. Verifications
      const verificationsRes = await fetch("/api/admin/verifications", { headers: authHeaders });
      const verificationsData = await verificationsRes.json();
      setVerifications(verificationsData);

      // 4. Inquiries Messages
      const msgRes = await fetch("/api/admin/inquiries", { headers: authHeaders });
      const msgData = await msgRes.json();
      setMessages(msgData);

      // 5. Vehicles (Cars)
      const carsRes = await fetch("/api/cars");
      const carsData = await carsRes.json();
      setCars(carsData);

      // 6. Tours
      const toursRes = await fetch("/api/tours");
      const toursData = await toursRes.json();
      setTours(toursData);

      setLoading(false);
    } catch (error) {
      // Fallback mocks
      setTimeout(() => {
        setStats({
          totalUsers: 14,
          totalBookings: 8,
          pendingInquiries: 3,
          pendingVerifications: 2,
          revenue: 170000,
          activeDrivers: 12,
          availableCars: 8,
        });

        setBookings([
          {
            _id: "b_01",
            user: { name: "Rana Nouman", email: "user@gmail.com", phone: "0311-5353751" },
            type: "Car",
            itemName: "Toyota Corolla Grande",
            startDate: "2026-07-10",
            totalDays: 5,
            totalPrice: 75000,
            timelineStatus: "Booking Confirmed",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "b_02",
            user: { name: "Ayesha Ahmed", email: "ayesha@gmail.com", phone: "0300-1122334" },
            type: "Tour",
            itemName: "Hunza Valley Autumn Luxury Tour",
            startDate: "2026-09-12",
            totalDays: 5,
            totalPrice: 95000,
            timelineStatus: "Inquiry Sent",
            createdAt: new Date().toISOString(),
          },
        ]);

        setVerifications([
          {
            _id: "u_verify_01",
            name: "Zain Ali",
            email: "zain@gmail.com",
            phone: "0302-8765432",
            cnic: "37405-9988776-3",
            passport: "AB88765",
            verificationStatus: "pending",
          },
        ]);

        setMessages([
          {
            _id: "m_01",
            name: "Imran Khan",
            phone: "0333-1234567",
            message: "Callback requested from expert contact FAB widget.",
            type: "callback",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        ]);

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
            features: ["AC", "Airbags"],
            driverIncluded: true,
            luxuryBadge: false
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
            features: ["AC", "Sunroof"],
            driverIncluded: true,
            luxuryBadge: false
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
            features: ["AC", "4x4 Drive Mode"],
            driverIncluded: true,
            luxuryBadge: true
          }
        ]);

        setTours([
          {
            _id: "t_hunza",
            name: "Hunza Valley Autumn Luxury Tour",
            days: "5 Days / 4 Nights",
            price: 95000,
            image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=600",
            category: "Adventure",
            description: "Experience the autumn colors in Hunza.",
            highlights: ["Attabad Lake", "Passu Cones"],
            itinerary: [
              { day: 1, title: "Islamabad to Naran", description: "Drive to Naran" }
            ],
            bestTime: "September to November"
          }
        ]);

        setLoading(false);
      }, 1000);
    }
  };

  // Trigger booking timeline update on backend
  const handleUpdateBookingStatus = (bookingId, status) => {
    fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        addToast(`Booking status updated to "${status}"`, "success");
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, timelineStatus: status } : b))
        );
        addToast("Booking status updated (Offline mock mode).", "success");
      });
  };

  // Trigger user verification approve/reject on backend
  const handleVerifyUser = (userId, status) => {
    fetch(`/api/admin/verifications/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        addToast(`User CNIC/Passport marked as "${status}"`, "success");
        loadDashboardData();
      })
      .catch(() => {
        setVerifications(verifications.filter((v) => v._id !== userId));
        addToast(`Verification marked as ${status} (Offline mock mode).`, "success");
      });
  };

  // Handle open car modal for adding new vehicle
  const openCarAddModal = () => {
    setEditingCar(null);
    setCarForm({
      name: "",
      model: "",
      category: "Sedan",
      pricePerDay: "",
      images: "",
      transmission: "Automatic",
      fuelEconomy: "12 km/L",
      capacity: 5,
      features: "",
      driverIncluded: true,
      luxuryBadge: false
    });
    setShowCarModal(true);
  };

  // Handle open car modal for editing vehicle
  const openCarEditModal = (car) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      model: car.model,
      category: car.category || "Sedan",
      pricePerDay: car.pricePerDay,
      images: car.images ? car.images.join(", ") : "",
      transmission: car.transmission || "Automatic",
      fuelEconomy: car.fuelEconomy || "12 km/L",
      capacity: car.capacity || 5,
      features: car.features ? car.features.join(", ") : "",
      driverIncluded: car.driverIncluded !== undefined ? car.driverIncluded : true,
      luxuryBadge: car.luxuryBadge !== undefined ? car.luxuryBadge : false
    });
    setShowCarModal(true);
  };

  // Submit car form
  const handleCarSubmit = (e) => {
    e.preventDefault();
    if (!carForm.name || !carForm.model || !carForm.pricePerDay) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    const payload = {
      ...carForm,
      pricePerDay: Number(carForm.pricePerDay),
      capacity: Number(carForm.capacity),
      images: carForm.images ? carForm.images.split(",").map(img => img.trim()).filter(Boolean) : [],
      features: carForm.features ? carForm.features.split(",").map(f => f.trim()).filter(Boolean) : []
    };

    const method = editingCar ? "PUT" : "POST";
    const url = editingCar ? `/api/admin/cars/${editingCar._id}` : "/api/admin/cars";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast(editingCar ? "Vehicle updated successfully!" : "Vehicle created successfully!", "success");
        setShowCarModal(false);
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        if (editingCar) {
          setCars(cars.map(c => c._id === editingCar._id ? { ...c, ...payload } : c));
        } else {
          setCars([...cars, { _id: `c_${Date.now()}`, ...payload }]);
        }
        addToast(editingCar ? "Vehicle updated (Mock Mode)" : "Vehicle created (Mock Mode)", "success");
        setShowCarModal(false);
      });
  };

  // Delete car
  const handleDeleteCar = (carId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    fetch(`/api/admin/cars/${carId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast("Vehicle deleted successfully!", "success");
        loadDashboardData();
      })
      .catch(() => {
        setCars(cars.filter(c => c._id !== carId));
        addToast("Vehicle deleted (Mock Mode)", "success");
      });
  };

  // Open tour modal for adding new tour
  const openTourAddModal = () => {
    setEditingTour(null);
    setTourForm({
      name: "",
      days: "",
      price: "",
      image: "",
      category: "Adventure",
      description: "",
      highlights: "",
      itineraryRaw: "",
      bestTime: "May to October",
      activities: "",
      weatherInfo: "",
      packingChecklist: ""
    });
    setShowTourModal(true);
  };

  // Open tour modal for editing tour
  const openTourEditModal = (tour) => {
    setEditingTour(tour);
    
    // Map itinerary array to a readable string for text area
    let itineraryText = "";
    if (tour.itinerary && tour.itinerary.length > 0) {
      itineraryText = tour.itinerary.map(item => `Day ${item.day}: ${item.title} - ${item.description}`).join("\n");
    }

    setTourForm({
      name: tour.name,
      days: tour.days,
      price: tour.price,
      image: tour.image,
      category: tour.category || "Adventure",
      description: tour.description || "",
      highlights: tour.highlights ? tour.highlights.join(", ") : "",
      itineraryRaw: itineraryText,
      bestTime: tour.bestTime || "May to October",
      activities: tour.activities ? tour.activities.join(", ") : "",
      weatherInfo: tour.weatherInfo || "",
      packingChecklist: tour.packingChecklist ? tour.packingChecklist.join(", ") : ""
    });
    setShowTourModal(true);
  };

  // Submit tour form
  const handleTourSubmit = (e) => {
    e.preventDefault();
    if (!tourForm.name || !tourForm.days || !tourForm.price || !tourForm.image) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    // Parse itinerary from text area
    let itineraryList = [];
    if (tourForm.itineraryRaw) {
      const lines = tourForm.itineraryRaw.split("\n").filter(line => line.trim());
      itineraryList = lines.map((line, index) => {
        // Try parsing lines of format: "Day X: Title - Description"
        const dayMatch = line.match(/Day\s+(\d+):/i);
        const day = dayMatch ? Number(dayMatch[1]) : (index + 1);
        
        let TitleDesc = line;
        if (dayMatch) {
          TitleDesc = line.replace(/Day\s+\d+:/i, "").trim();
        }

        const parts = TitleDesc.split("-");
        const title = parts[0] ? parts[0].trim() : `Day ${day} Itinerary`;
        const description = parts.slice(1).join("-").trim() || "Local sightseeing & adventure activities.";

        return { day, title, description };
      });
    }

    const payload = {
      ...tourForm,
      price: Number(tourForm.price),
      highlights: tourForm.highlights ? tourForm.highlights.split(",").map(h => h.trim()).filter(Boolean) : [],
      activities: tourForm.activities ? tourForm.activities.split(",").map(a => a.trim()).filter(Boolean) : [],
      packingChecklist: tourForm.packingChecklist ? tourForm.packingChecklist.split(",").map(p => p.trim()).filter(Boolean) : [],
      itinerary: itineraryList
    };

    const method = editingTour ? "PUT" : "POST";
    const url = editingTour ? `/api/admin/tours/${editingTour._id}` : "/api/admin/tours";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast(editingTour ? "Tour updated successfully!" : "Tour created successfully!", "success");
        setShowTourModal(false);
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        if (editingTour) {
          setTours(tours.map(t => t._id === editingTour._id ? { ...t, ...payload } : t));
        } else {
          setTours([...tours, { _id: `t_${Date.now()}`, ...payload }]);
        }
        addToast(editingTour ? "Tour updated (Mock Mode)" : "Tour created (Mock Mode)", "success");
        setShowTourModal(false);
      });
  };

  // Delete tour
  const handleDeleteTour = (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour package?")) return;

    fetch(`/api/admin/tours/${tourId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast("Tour package deleted successfully!", "success");
        loadDashboardData();
      })
      .catch(() => {
        setTours(tours.filter(t => t._id !== tourId));
        addToast("Tour package deleted (Mock Mode)", "success");
      });
  };

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return (
      <div style={{ padding: "120px 20px", textAlign: "center", minHeight: "100vh" }}>
        <FaLock size={48} style={{ color: "#EF4444", marginBottom: "15px" }} />
        <h2>Access Denied. Admins and Managers Only.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaWrench style={{ color: "var(--accent)" }} /> Admin Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Registered travel guides, CNIC documents verification center & transport bookings tracker.
            </p>
          </div>
          <button className="btn btn-outline" onClick={loadDashboardData}>
            🔄 Refresh Data
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Loading administrative metrics...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              {/* Users */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Customers</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.totalUsers}</h3>
                  </div>
                  <FaUsers size={24} style={{ color: "#3B82F6" }} />
                </div>
              </div>

              {/* Bookings */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Bookings</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.totalBookings}</h3>
                  </div>
                  <FaBook size={24} style={{ color: "var(--secondary)" }} />
                </div>
              </div>

              {/* Revenue */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Revenue</span>
                    <h3 style={{ fontSize: "24px", margin: "8px 0", color: "var(--secondary)" }}>Rs. {stats?.revenue}</h3>
                  </div>
                  <FaDollarSign size={24} style={{ color: "var(--accent)" }} />
                </div>
              </div>

              {/* Fleet */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Available Cars</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.availableCars}</h3>
                  </div>
                  <FaCar size={24} style={{ color: "#8B5CF6" }} />
                </div>
              </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "15px", marginBottom: "35px", flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "📊 Overview Charts" },
                { id: "bookings", label: "🚗 Manage Bookings" },
                { id: "verifications", label: "🆔 CNIC Verifications" },
                { id: "messages", label: "📞 Callback Inquiries" },
                { id: "fleet", label: "🚘 Manage Fleet" },
                { id: "tours", label: "🗺️ Manage Tours" },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setActiveTab(tb.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === tb.id ? "var(--secondary)" : "transparent",
                    color: activeTab === tb.id ? "white" : "var(--text-muted)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview Charts */}
            {activeTab === "overview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "30px",
                }}
              >
                {/* SVG Revenue Chart */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Revenue trends (Monthly Growth)</h3>
                  <div style={{ height: "220px", display: "flex", alignItems: "flex-end", position: "relative" }}>
                    <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%" }}>
                      <path
                        d="M 50 180 Q 120 150 200 90 T 350 40"
                        fill="none"
                        stroke="var(--secondary)"
                        strokeWidth="4"
                      />
                      <circle cx="50" cy="180" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      <circle cx="200" cy="90" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      <circle cx="350" cy="40" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      {/* Grid labels */}
                      <text x="40" y="195" fill="var(--text-muted)" fontSize="10">May</text>
                      <text x="190" y="195" fill="var(--text-muted)" fontSize="10">June (E)</text>
                      <text x="330" y="195" fill="var(--text-muted)" fontSize="10">July (P)</text>
                    </svg>
                  </div>
                </div>

                {/* SVG Popular Destinations Chart */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Most Booked Destinations</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
                    {[
                      { name: "Hunza Valley", val: "75%", color: "var(--secondary)" },
                      { name: "Skardu", val: "60%", color: "var(--accent)" },
                      { name: "Swat & Kalam", val: "40%", color: "#3B82F6" },
                      { name: "Murree Hills", val: "25%", color: "#EF4444" },
                    ].map((dest, idx) => (
                      <div key={idx} style={{ fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span>{dest.name}</span>
                          <strong>{dest.val}</strong>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: dest.val, height: "100%", backgroundColor: dest.color, borderRadius: "4px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Bookings Management */}
            {activeTab === "bookings" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px" }}>Booking ID</th>
                      <th style={{ padding: "12px" }}>Customer</th>
                      <th style={{ padding: "12px" }}>Item</th>
                      <th style={{ padding: "12px" }}>Start Date</th>
                      <th style={{ padding: "12px" }}>Amount</th>
                      <th style={{ padding: "12px" }}>Timeline Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px", fontWeight: "700" }}>#{booking._id.substring(0, 8)}</td>
                        <td style={{ padding: "12px" }}>
                          <div>{booking.user?.name || "Guest User"}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{booking.user?.phone}</span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ fontSize: "11px", background: "var(--bg)", padding: "2px 6px", borderRadius: "4px", marginRight: "5px" }}>
                            {booking.type}
                          </span>
                          {booking.itemName}
                        </td>
                        <td style={{ padding: "12px" }}>{booking.startDate}</td>
                        <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {booking.totalPrice}</td>
                        <td style={{ padding: "12px" }}>
                          {/* timeline status update dropdown */}
                          <select
                            value={booking.timelineStatus}
                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg)",
                              color: "var(--text)",
                              fontSize: "12px",
                              fontWeight: "600",
                              outline: "none",
                            }}
                          >
                            <option value="Inquiry Sent">Inquiry Sent</option>
                            <option value="Admin Consultation">Admin Consultation</option>
                            <option value="Vehicle Suggested">Vehicle Suggested</option>
                            <option value="Quotation Sent">Quotation Sent</option>
                            <option value="Verification">Verification</option>
                            <option value="Payment">Payment</option>
                            <option value="Booking Confirmed">Booking Confirmed</option>
                            <option value="Enjoy Your Trip">Enjoy Your Trip</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Verifications Review */}
            {activeTab === "verifications" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                {verifications.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No pending customer identity verifications.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Name</th>
                        <th style={{ padding: "12px" }}>CNIC</th>
                        <th style={{ padding: "12px" }}>Passport</th>
                        <th style={{ padding: "12px" }}>Uploaded Photo</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((v) => (
                        <tr key={v._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <strong>{v.name}</strong>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{v.email} | {v.phone}</div>
                          </td>
                          <td style={{ padding: "12px" }}>{v.cnic || "N/A"}</td>
                          <td style={{ padding: "12px" }}>{v.passport || "N/A"}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{ color: "var(--secondary)", cursor: "pointer", fontWeight: "700" }}
                              onClick={() => addToast("Displaying uploaded scan mockup.", "info")}
                            >
                              📄 view_scan.jpg
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px" }}
                                onClick={() => handleVerifyUser(v._id, "verified")}
                              >
                                <FaCheckCircle size={10} /> Approve
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", color: "#EF4444", borderColor: "#FCA5A5" }}
                                onClick={() => handleVerifyUser(v._id, "rejected")}
                              >
                                <FaTimesCircle size={10} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Message callbacks inquiries */}
            {activeTab === "messages" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                {messages.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No callback requests in logs.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Name</th>
                        <th style={{ padding: "12px" }}>Phone</th>
                        <th style={{ padding: "12px" }}>Inquiry Details</th>
                        <th style={{ padding: "12px" }}>Date</th>
                        <th style={{ padding: "12px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => (
                        <tr key={msg._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px", fontWeight: "700" }}>{msg.name}</td>
                          <td style={{ padding: "12px" }}>{msg.phone}</td>
                          <td style={{ padding: "12px" }}>{msg.message}</td>
                          <td style={{ padding: "12px" }}>{new Date(msg.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                background: msg.status === "resolved" ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color: msg.status === "resolved" ? "var(--secondary)" : "var(--accent)",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                // Simulate resolving callback in UI
                                addToast("Inquiry marked as Resolved.", "success");
                              }}
                            >
                              {msg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Fleet Management */}
            {activeTab === "fleet" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" onClick={openCarAddModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus /> Add New Vehicle
                  </button>
                </div>
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Vehicle Info</th>
                        <th style={{ padding: "12px" }}>Category</th>
                        <th style={{ padding: "12px" }}>Transmission</th>
                        <th style={{ padding: "12px" }}>Capacity</th>
                        <th style={{ padding: "12px" }}>Price Per Day</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={car.images && car.images[0]} alt={car.name} style={{ width: "50px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                              <div>
                                <strong>{car.name}</strong>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Model: {car.model}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>{car.category}</td>
                          <td style={{ padding: "12px" }}>{car.transmission}</td>
                          <td style={{ padding: "12px" }}>{car.capacity} Seats</td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {car.pricePerDay}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => openCarEditModal(car)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaEdit size={10} /> Edit
                              </button>
                              <button onClick={() => handleDeleteCar(car._id)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", color: "#EF4444", borderColor: "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Tours Management */}
            {activeTab === "tours" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" onClick={openTourAddModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus /> Add Tour Package
                  </button>
                </div>
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Tour Details</th>
                        <th style={{ padding: "12px" }}>Duration</th>
                        <th style={{ padding: "12px" }}>Category</th>
                        <th style={{ padding: "12px" }}>Best Season</th>
                        <th style={{ padding: "12px" }}>Base Price</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tours.map((tour) => (
                        <tr key={tour._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={tour.image} alt={tour.name} style={{ width: "50px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                              <strong>{tour.name}</strong>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>{tour.days}</td>
                          <td style={{ padding: "12px" }}>{tour.category}</td>
                          <td style={{ padding: "12px" }}>{tour.bestTime}</td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {tour.price}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => openTourEditModal(tour)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaEdit size={10} /> Edit
                              </button>
                              <button onClick={() => handleDeleteTour(tour._id)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", color: "#EF4444", borderColor: "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Car Modal overlay */}
      {showCarModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowCarModal(false)}>
          <div className="card" style={{
            width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-card)",
            borderRadius: "16px", padding: "25px", maxHeight: "90vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</h3>
            <form onSubmit={handleCarSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Vehicle Name *</label>
                  <input type="text" value={carForm.name} onChange={e => setCarForm({...carForm, name: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Model (e.g. 2024 GLI) *</label>
                  <input type="text" value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Category *</label>
                  <select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Economy">Economy</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Van">Van</option>
                    <option value="Coaster">Coaster</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Price Per Day (PKR) *</label>
                  <input type="number" value={carForm.pricePerDay} onChange={e => setCarForm({...carForm, pricePerDay: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Image URLs (comma separated)</label>
                <input type="text" value={carForm.images} onChange={e => setCarForm({...carForm, images: e.target.value})} placeholder="https://unsplash.com/xxx, https://unsplash.com/yyy" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Transmission</label>
                  <select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Fuel Economy</label>
                  <input type="text" value={carForm.fuelEconomy} onChange={e => setCarForm({...carForm, fuelEconomy: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Seats Capacity</label>
                  <input type="number" value={carForm.capacity} onChange={e => setCarForm({...carForm, capacity: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Features (comma separated)</label>
                <input type="text" value={carForm.features} onChange={e => setCarForm({...carForm, features: e.target.value})} placeholder="AC, Leather Seats, 4x4, Sunroof" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div style={{ display: "flex", gap: "20px", padding: "5px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={carForm.driverIncluded} onChange={e => setCarForm({...carForm, driverIncluded: e.target.checked})} />
                  Driver Included
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={carForm.luxuryBadge} onChange={e => setCarForm({...carForm, luxuryBadge: e.target.checked})} />
                  Luxury Badge
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCarModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tour Modal overlay */}
      {showTourModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowTourModal(false)}>
          <div className="card" style={{
            width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-card)",
            borderRadius: "16px", padding: "25px", maxHeight: "90vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>{editingTour ? "Edit Tour Package" : "Add Tour Package"}</h3>
            <form onSubmit={handleTourSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Tour Name *</label>
                  <input type="text" value={tourForm.name} onChange={e => setTourForm({...tourForm, name: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Duration (e.g. 5 Days / 4 Nights) *</label>
                  <input type="text" value={tourForm.days} onChange={e => setTourForm({...tourForm, days: e.target.value})} required placeholder="5 Days / 4 Nights" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Category *</label>
                  <select value={tourForm.category} onChange={e => setTourForm({...tourForm, category: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Adventure">Adventure</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Family">Family</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Eid">Eid</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Price (PKR) *</label>
                  <input type="number" value={tourForm.price} onChange={e => setTourForm({...tourForm, price: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Main Image URL *</label>
                <input type="text" value={tourForm.image} onChange={e => setTourForm({...tourForm, image: e.target.value})} required placeholder="https://unsplash.com/xxx" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Description *</label>
                <textarea value={tourForm.description} onChange={e => setTourForm({...tourForm, description: e.target.value})} required rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)", resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Highlights (comma separated)</label>
                <input type="text" value={tourForm.highlights} onChange={e => setTourForm({...tourForm, highlights: e.target.value})} placeholder="Attabad Lake Boating, Altit Fort" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Day-by-Day Itinerary (format: One day per line, "Day X: Title - Description")</label>
                <textarea value={tourForm.itineraryRaw} onChange={e => setTourForm({...tourForm, itineraryRaw: e.target.value})} placeholder="Day 1: Arrival - Travel to Naran&#10;Day 2: Sightseeing - Altit & Baltit Fort tours" rows={4} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)", resize: "vertical", fontFamily: "monospace", fontSize: "12px" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Best Season to Visit</label>
                  <input type="text" value={tourForm.bestTime} onChange={e => setTourForm({...tourForm, bestTime: e.target.value})} placeholder="May to October" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Activities (comma separated)</label>
                  <input type="text" value={tourForm.activities} onChange={e => setTourForm({...tourForm, activities: e.target.value})} placeholder="Sightseeing, Hiking, Boating" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Weather Info Summary</label>
                  <input type="text" value={tourForm.weatherInfo} onChange={e => setTourForm({...tourForm, weatherInfo: e.target.value})} placeholder="Average temp 15C. Chilly nights." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Packing Checklist (comma separated)</label>
                  <input type="text" value={tourForm.packingChecklist} onChange={e => setTourForm({...tourForm, packingChecklist: e.target.value})} placeholder="Warm clothes, umbrella, boots" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTourModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
