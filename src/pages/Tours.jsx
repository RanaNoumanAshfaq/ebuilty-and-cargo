function Tours() {
  const tours = [
    {
      name: "Hunza Valley Tour",
      days: "5 Days / 4 Nights",
      image:
        "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop",
      description:
        "Luxury guided tour with hotel, transport and sightseeing.",
    },

    {
      name: "Skardu Adventure",
      days: "7 Days / 6 Nights",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      description:
        "Mountain adventure with luxury vehicles and local guides.",
    },

    {
      name: "Swat Family Tour",
      days: "4 Days / 3 Nights",
      image:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop",
      description:
        "Perfect family trip with safe travel and comfortable hotels.",
    },

    {
      name: "Murree Honeymoon Package",
      days: "3 Days / 2 Nights",
      image:
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
      description:
        "Romantic luxury honeymoon package with private transport.",
    },
  ];

  return (
    <div
      style={{
        padding: "120px 50px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "55px",
          marginBottom: "50px",
          color: "#0f172a",
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
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={tour.image}
              alt={tour.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "25px" }}>
              <h2
                style={{
                  marginBottom: "10px",
                  color: "#0f172a",
                }}
              >
                {tour.name}
              </h2>

              <p
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                {tour.days}
              </p>

              <p
                style={{
                  color: "#475569",
                  lineHeight: "1.6",
                }}
              >
                {tour.description}
              </p>

              <button
                style={{
                  marginTop: "20px",
                  padding: "14px 25px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#22c55e",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Contact Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}