function BudgetCars() {
  return (
    <section
      style={{
        padding: "100px 60px",
        background: "white",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "45px",
          marginBottom: "60px",
        }}
      >
        Budget Based Car Recommendations
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "30px",
        }}
      >
        <div style={carCard}>
          <h3>Low Budget</h3>
          <p>Corolla</p>
          <p>Suzuki</p>
        </div>

        <div style={carCard}>
          <h3>Medium Budget</h3>
          <p>Civic</p>
          <p>BRV</p>
        </div>

        <div style={carCard}>
          <h3>Luxury</h3>
          <p>Prado</p>
          <p>Land Cruiser</p>
        </div>

        <div style={carCard}>
          <h3>Family / Group</h3>
          <p>Hiace</p>
          <p>Coaster</p>
        </div>
      </div>
    </section>
  );
}

const carCard = {
  background: "#0f172a",
  color: "white",
  padding: "35px",
  borderRadius: "20px",
};

export default BudgetCars;