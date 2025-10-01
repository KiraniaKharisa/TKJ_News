import Header from "../components/Header"
import HeroSection from "../components/Hero-Section"
import TrendingSection from "../components/Trending-Section"
import LatestPopularSection from "../components/Latest-Popular-Section"
import CategoriesSection from "../components/Categories-Section"
import Footer from "../components/Footer"
import Loading from "../components/ui/Loading"

export default function Home() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          <HeroSection />
          <TrendingSection />
          <LatestPopularSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}

