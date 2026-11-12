import Header from "../components/Header";
import Hero from "../components/Hero";
//import Categories from "../components/Categories";
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
        //<Categories />
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