import Header from "../components/Header";
import Hero from "../components/Hero";
import BestSellers from "../components/BestSellers";
import Benefits from "../components/Benefits";
import Rewards from "../components/Rewards";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <BestSellers />
        <Benefits />
        <Rewards />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}

export default Home;