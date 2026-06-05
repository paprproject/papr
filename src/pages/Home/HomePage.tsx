import HeroSection from "../../components/home/HeroSection";
import TickerBar from "../../components/home/TickerBar";
import TrustBar from "../../components/home/TrustBar";
import WhyPaprSection from "../../components/home/WhyPaprSection";
import ProductCategoriesSection from "../../components/home/ProductCategoriesSection";
import HowItWorksSection from "../../components/home/HowItWorksSection";

function HomePage() {
  return (
    <>
      <TickerBar />
      <HeroSection />
      <TrustBar />
      <WhyPaprSection />
      <ProductCategoriesSection />
      <HowItWorksSection />
    </>
  );
}



export default HomePage;