import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FaSearch,
  FaMicrophone,
  FaCloudSun,
  FaUsers,
  FaCar,
  FaMapMarkedAlt,
  FaStar,
  FaCheck,
  FaCalendarAlt,
  FaChevronDown,
  FaPlay,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";

const FAMOUS_DESTINATIONS = [
  { name: "Hunza Valley", desc: "Autumn colors & peak views", key: "Hunza" },
  { name: "Skardu Karakoram", desc: "Cold deserts & crystal lakes", key: "Skardu" },
  { name: "Swat & Kalam", desc: "Green pastures & pine valleys", key: "Swat" },
  { name: "Murree Hills", desc: "Snowy ridges & pine forests", key: "Murree" },
];

const WEATHER_MOCKS = {
  Hunza: { temp: "14°C", condition: "Sunny", wind: "10 km/h", icon: "☀️" },
  Skardu: { temp: "11°C", condition: "Windy", wind: "18 km/h", icon: "💨" },
  Swat: { temp: "22°C", condition: "Cloudy", wind: "8 km/h", icon: "⛅" },
  Murree: { temp: "18°C", condition: "Rainy", wind: "12 km/h", icon: "🌧️" },
  Islamabad: { temp: "34°C", condition: "Sunny", wind: "6 km/h", icon: "☀️" },
};

const TESTIMONIALS = [
  {
    name: "John Miller",
    country: "USA",
    flag: "🇺🇸",
    text: "Khan Tourism provided the most professional guide and Prado SUV. Traveling Hunza was smooth, safe, and truly luxurious. Five stars!",
    rating: 5,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Ayesha Ahmed",
    country: "Pakistan",
    flag: "🇵🇰",
    text: "Mera Swat ka family tour buhat acha raha. Gari bilkul saaf thi aur driver buhat zayada tameezdar aur safety driver tha.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Dr. Kenji Sato",
    country: "Japan",
    flag: "🇯🇵",
    text: "Highly respect the punctuality and support during our Skardu research expedition. Zahid, our driver, was exceptionally skilled.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
  },
];

const GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600",
];

export default function Home() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Search autocomplete & Voice speech search state
  const [searchVal, setSearchVal] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  // Weather widget state
  const [selectedWeatherCity, setSelectedWeatherCity] = useState("Hunza");

  // Counter states
  const [counterTravelers, setCounterTravelers] = useState(0);
  const [counterCars, setCounterCars] = useState(0);
  const [counterPackages, setCounterPackages] = useState(0);
  const [counterGuides, setCounterGuides] = useState(0);

  // Carousel index state
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Accordion faq index state
  const [activeFaq, setActiveFaq] = useState(null);

  // Lightbox picture state
  const [lightboxImg, setLightboxImg] = useState(null);

  // Counting logic implementation
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounterTravelers(Math.min(5000, Math.round((5000 / steps) * step)));
      setCounterCars(Math.min(150, Math.round((150 / steps) * step)));
      setCounterPackages(Math.min(100, Math.round((100 / steps) * step)));
      setCounterGuides(Math.min(50, Math.round((50 / steps) * step)));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Voice Search setup using Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Your browser does not support Speech Recognition.", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceListening(true);
      addToast("Listening for destination name (e.g. Hunza)...", "info");
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchVal(speechToText);
      setVoiceListening(false);
      addToast(`Searched: "${speechToText}"`, "success");
      handleSearchSubmit(speechToText);
    };

    recognition.onerror = () => {
      setVoiceListening(false);
      addToast("Speech recognition failed. Try speaking again.", "error");
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  const handleSearchSubmit = (val = searchVal) => {
    if (!val) {
      addToast("Please enter a destination to search.", "warning");
      return;
    }
    // Simple redirect to tours filtered by that query
    navigate(`/tours?search=${encodeURIComponent(val)}`);
  };

  // Slideshow images for Hero section background
  const heroImages = [
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1920",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1920",
  ];
  const [heroBgIdx, setHeroBgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };
  const prevTestimonial = () => {
    setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 1. Full-screen Hero Section with Auto Slideshow */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 20px",
          color: "white",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Cinematic Backdrop Slideshow */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(9, 13, 26, 0.85)), url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: -2,
              opacity: idx === heroBgIdx ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        ))}

        {/* Animated Gradient Light Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "850px", width: "100%", zIndex: 1 }} className="animate-fade-in">
          {/* Animated Gold Luxury badge */}
          <span
            style={{
              display: "inline-block",
              background: "rgba(245, 158, 11, 0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "20px",
            }}
          >
            ⭐ Pakistan's Premier Travel Partner
          </span>

          {/* Typing Title Effect */}
          <h1
            style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(32px, 5vw, 68px)",
              lineHeight: 1.1,
              marginBottom: "20px",
              fontWeight: "800",
              color: "white",
            }}
          >
            Explore Pakistan Like <br />
            <span style={{ color: "var(--secondary)" }}>Never Before</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 19px)",
              color: "rgba(255,255,255,0.85)",
              marginBottom: "35px",
              fontWeight: "400",
              maxWidth: "650px",
              marginInline: "auto",
            }}
          >
            Professional private guides, customized tours, and luxury vehicles (Grande, Prado, V8) for a secure, high-end experience in Skardu, Hunza & Swat.
          </p>

          {/* Search bar inside Hero Section */}
          <div
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "50px",
                padding: "8px 12px 8px 24px",
                boxShadow: "var(--shadow-lg)",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <FaSearch style={{ color: "rgba(255,255,255,0.7)", marginRight: "10px" }} />
              <input
                type="text"
                placeholder="Where do you want to travel? (e.g. Hunza)"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowSuggest(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggest(searchVal.length > 0)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: "white",
                  outline: "none",
                  fontSize: "15px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              />

              {/* Voice button */}
              <button
                onClick={handleVoiceSearch}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: voiceListening ? "var(--secondary)" : "rgba(255,255,255,0.8)",
                  fontSize: "16px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: voiceListening ? "pulse-glow 1.5s infinite" : "none",
                  borderRadius: "50%",
                  backgroundColor: voiceListening ? "rgba(34, 197, 94, 0.2)" : "transparent",
                  marginRight: "5px",
                }}
                title="Search with Voice"
              >
                <FaMicrophone />
              </button>

              {/* CTA Button */}
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: "40px",
                  padding: "10px 24px",
                  fontSize: "14px",
                }}
                onClick={() => handleSearchSubmit()}
              >
                Find Tour
              </button>
            </div>

            {/* Autocomplete Suggestions dropdown */}
            {showSuggest && (
              <div
                className="glass-dark animate-fade-in"
                style={{
                  position: "absolute",
                  top: "65px",
                  left: 0,
                  width: "100%",
                  borderRadius: "16px",
                  padding: "10px 0",
                  textAlign: "left",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 20,
                }}
              >
                {FAMOUS_DESTINATIONS.filter((d) =>
                  d.name.toLowerCase().includes(searchVal.toLowerCase())
                ).map((dest, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    className="suggest-item"
                    onClick={() => {
                      setSearchVal(dest.name);
                      setShowSuggest(false);
                      handleSearchSubmit(dest.name);
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "white" }}>
                      📍 {dest.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                      {dest.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/planner" className="btn btn-accent animate-float">
              🗺️ Personalized Travel Planner
            </Link>
            <Link to="/cars" className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
              <FaCar /> Rent Luxury Car
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Weather Forecast Panel */}
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800" }}>
                🌤️ Live Weather Preview
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Check live weather forecasts to schedule your Pakistan tour safely.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.keys(WEATHER_MOCKS).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedWeatherCity(city)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: selectedWeatherCity === city ? "var(--secondary)" : "var(--bg)",
                    color: selectedWeatherCity === city ? "var(--white)" : "var(--text)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Weather preview card */}
          <div
            className="glass"
            style={{
              borderRadius: "20px",
              padding: "30px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              alignItems: "center",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "60px" }}>{WEATHER_MOCKS[selectedWeatherCity].icon}</span>
              <div>
                <h3 style={{ fontSize: "24px", color: "var(--text)" }}>{selectedWeatherCity}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Current Weather</p>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--secondary)" }}>
                {WEATHER_MOCKS[selectedWeatherCity].temp}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>
                {WEATHER_MOCKS[selectedWeatherCity].condition}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Wind Speed</div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>{WEATHER_MOCKS[selectedWeatherCity].wind}</div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Best Booking State</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent)" }}>
                🚀 Perfect time to visit!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Statistics Section */}
      <section style={{ background: "var(--primary)", color: "white" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            textAlign: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaUsers style={{ color: "var(--secondary)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterTravelers}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Happy Travelers</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaCar style={{ color: "var(--accent)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterCars}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Premium Vehicles</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaMapMarkedAlt style={{ color: "var(--secondary)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterPackages}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Custom Packages</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaCheck style={{ color: "var(--accent)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterGuides}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Local Tour Guides</p>
          </div>
        </div>
      </section>

      {/* 4. Beautiful Timeline Checklist (How It Works) */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            📅 How It Works (Timeline)
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px", maxWidth: "600px", marginInline: "auto" }}>
            A smooth, interactive verification and booking flow tailored for local & international travelers.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              gap: "35px",
            }}
          >
            {/* Timeline center line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "25px",
                width: "2px",
                backgroundColor: "var(--border)",
              }}
              className="timeline-bar"
            />

            {[
              { num: "01", title: "Inquiry Sent", desc: "Select a vehicle or tour package and send a callback or booking request." },
              { num: "02", title: "Admin Consultation", desc: "Our managers (Abdullah or Waleed) contact you to align itinerary details." },
              { num: "03", title: "Vehicle Suggested", desc: "Choose optimal cars (Grande, Prado, Hiace) based on track difficulties." },
              { num: "04", title: "Quotation Sent", desc: "Receive customized budget quotes including fuel estimation and guide fees." },
              { num: "05", title: "Verification Status", desc: "Registered users upload CNIC/Passport details for safe travel passes." },
              { num: "06", title: "Booking Confirmation", desc: "Confirm booking timeline status, driver information, and enjoy your Pakistan holiday!" },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "25px",
                  textAlign: "left",
                  position: "relative",
                }}
                className="timeline-item"
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-card)",
                    border: "2px solid var(--secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    color: "var(--secondary)",
                    zIndex: 2,
                  }}
                >
                  {step.num}
                </div>
                <div
                  className="card"
                  style={{
                    flex: 1,
                    padding: "20px 25px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h4 style={{ fontSize: "16px", marginBottom: "5px" }}>{step.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Destination Explorer Cards */}
      <section style={{ backgroundColor: "var(--bg-card)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            🗺️ Explore Popular Pakistan Destinations
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>
            Discover majestic northern peaks, lush valleys, and cold sandy deserts.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "30px",
            }}
          >
            {FAMOUS_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/tours?search=${dest.key}`)}
              >
                <div style={{ position: "relative", height: "200px" }}>
                  <img
                    src={GALLERY_PHOTOS[idx % GALLERY_PHOTOS.length]}
                    alt={dest.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.5s" }}
                    className="zoom-image"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "15px",
                      left: "15px",
                      background: "rgba(15,23,42,0.75)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ⭐ Featured
                  </div>
                </div>
                <div style={{ padding: "20px", textAlign: "left" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{dest.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "15px" }}>{dest.desc}</p>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    Explore Tours <FaChevronRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Travel Memories Lightbox Gallery */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            📸 Travel Memories Gallery
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>
            Real customer memories, drone footage, and scenic photography clicks.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {GALLERY_PHOTOS.map((imgUrl, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  height: "250px",
                  cursor: "zoom-in",
                  position: "relative",
                }}
                className="gallery-item-card"
                onClick={() => setLightboxImg(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt="Pakistan Tourism"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.3s" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    opacity: 0,
                    transition: "0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                  className="gallery-item-hover"
                >
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>🔍 View Photo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials Customer Reviews Carousel */}
      <section style={{ backgroundColor: "var(--bg-card)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            ⭐ Travelers Testimonials
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>
            Real reviews and feedback from verified international & national tourists.
          </p>

          <div
            className="card glass"
            style={{
              padding: "40px",
              borderRadius: "24px",
              position: "relative",
              border: "1px solid var(--border)",
            }}
          >
            {/* Nav Arrows */}
            <button
              onClick={prevTestimonial}
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow)",
              }}
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextTestimonial}
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow)",
              }}
            >
              <FaChevronRight />
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img
                src={TESTIMONIALS[testimonialIdx].img}
                alt="Client"
                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--secondary)" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "15px" }}>
              {[...Array(TESTIMONIALS[testimonialIdx].rating)].map((_, i) => (
                <FaStar key={i} style={{ color: "var(--accent)" }} />
              ))}
            </div>
            <p
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                lineHeight: "1.8",
                marginBottom: "25px",
                color: "var(--text)",
              }}
            >
              "{TESTIMONIALS[testimonialIdx].text}"
            </p>
            <h4 style={{ fontSize: "16px", color: "var(--text)" }}>
              {TESTIMONIALS[testimonialIdx].name}
              <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                {TESTIMONIALS[testimonialIdx].flag} {TESTIMONIALS[testimonialIdx].country}
              </span>
            </h4>
            <span
              style={{
                display: "inline-block",
                marginTop: "10px",
                background: "rgba(34, 197, 94, 0.1)",
                color: "var(--secondary)",
                padding: "3px 10px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              Verified Traveler
            </span>
          </div>
        </div>
      </section>

      {/* 8. FAQs Accordion */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px", textAlign: "center" }}>
            ❓ Frequently Asked Questions
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "40px", textAlign: "center" }}>
            Got questions about vehicle rentals, custom tour pricing, and guide availability?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {[
              { q: "Is fuel cost included in the rent-a-car pricing?", a: "No, standard vehicle rent-a-car quotes exclude fuel. However, our smart calculations inside the planner can give you a highly accurate fuel estimate based on track distance and car mileage." },
              { q: "Does the car rental fee include drivers?", a: "Yes! All luxury SUV and Sedan rentals for northern tourism include experienced local mountain drivers for safety. Under specific verified packages, self-drive can be authorized by managers." },
              { q: "What documents are required to confirm booking?", a: "To complete traveler registration and obtain government border passage NOCs, users must register an account and upload passport pages or clear CNIC photos on their user profile dashboard." },
              { q: "How can I pay for my tour packages?", a: "We accept payments through Bank Transfer, EasyPaisa, and JazzCash. International travelers can consult with CEO Abdullah Khan on custom payments." },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 25px",
                    background: "var(--bg-card)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--text)",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  {faq.q}
                  <FaChevronDown
                    style={{
                      transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  />
                </button>
                {activeFaq === idx && (
                  <div
                    style={{
                      padding: "20px 25px",
                      backgroundColor: "var(--bg-card)",
                      borderTop: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Expanded view"
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          />
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: "absolute",
              top: "25px",
              right: "25px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "30px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Styled inline components styles */}
      <style>{`
        .suggest-item:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
        .gallery-item-card:hover .gallery-item-hover {
          opacity: 1 !important;
        }
        .gallery-item-card:hover img {
          transform: scale(1.05);
        }
        .zoom-image:hover {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}