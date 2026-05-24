import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Consultation from "../components/Consultation";
import BudgetCars from "../components/BudgetCars";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Consultation />
      <BudgetCars />
      <WhatsAppButton />
      <Footer />
    </>
  );
}

export default Home;