import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <section
      style={{
        height: "100vh",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "70px" }}>
        KHAN TOURISM & GUIDE
      </h1>

      <p
        style={{
          fontSize: "24px",
          maxWidth: "800px",
        }}
      >
        Professional Tourism, Airport Pickup,
        Local Driver & Guided Travel Services
      </p>
    </section>
  );
}

function Cars() {
  return (
    <div style={{ padding: "120px 40px" }}>
      <h1>Cars Page</h1>
    </div>
  );
}

function Tours() {
  const tours = [
    {
      name: "Hunza Valley Tour",
      days: "5 Days / 4 Nights",
      image:
        "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop",
    },

    {
      name: "Skardu Adventure",
      days: "7 Days / 6 Nights",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <div
      style={{
        padding: "120px 40px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        Tour Packages
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "30px",
        }}
      >
        {tours.map((tour, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={tour.image}
              alt={tour.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "20px" }}>
              <h2>{tour.name}</h2>

              <p
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                }}
              >
                {tour.days}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div style={{ padding: "120px 40px" }}>
      <h1>Contact Page</h1>
    </div>
  );
}

function Navbar() {
  return (
    <nav
      style={{
        background: "#0f172a",
        color: "white",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2>KHAN TOURISM & GUIDE</h2>

      <div style={{ display: "flex", gap: "25px" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>

        <Link to="/cars" style={linkStyle}>
          Cars
        </Link>

        <Link to="/tours" style={linkStyle}>
          Tours
        </Link>

        <Link to="/contact" style={linkStyle}>
          Contact
        </Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;