import Header from "../components/Header";
import Hero from "../components/Hero";
import BestSellers from "../components/BestSellers";
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
        <Rewards />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}

export default Home;