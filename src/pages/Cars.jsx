function Cars() {
  const cars = [
    {
      name: "Toyota Corolla",
      image:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200&auto=format&fit=crop",
      type: "Low Budget",
    },

    {
      name: "Honda Civic",
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop",
      type: "Medium Budget",
    },

    {
      name: "Toyota Prado",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop",
      type: "Luxury",
    },

    {
      name: "Hiace",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
      type: "Family Tour",
    },
  ];

  return (
    <div style={{ padding: "120px 50px" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "50px",
          fontSize: "50px",
        }}
      >
        Our Vehicles
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "30px",
        }}
      >
        {cars.map((car, index) => (
          <div
            key={index}
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              background: "white",
            }}
          >
            <img
              src={car.image}
              alt={car.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "20px" }}>
              <h2>{car.name}</h2>
              <p>{car.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cars;