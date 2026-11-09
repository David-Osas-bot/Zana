import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProductCarousel from '@/components/landing/ProductCarousel';
import FeatureMarquee from '@/components/landing/Featuremarquee';
import Solutions from '@/components/landing/Solutions';
import Features from '@/components/landing/features/Features';
import Workflow from '@/components/landing/workflow/Workflow';
import Cutomervoices from '@/components/landing/Customervoices';
import Pricing from '@/components/landing/Pricing';
import Faq from '@/components/landing/Faq';
import Footer from '@/components/landing/Footer';


// .z-page (from the theme CSS) paints the page black or white and flips with the toggle.
export default function Landing() {
  return (
    <div className="z-page min-h-screen">
      <Navbar />
      <Hero />
      <ProductCarousel />
      <FeatureMarquee />
      <Solutions />
      <Features />
      <Workflow />
      <Cutomervoices />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}
