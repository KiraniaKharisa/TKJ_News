import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Helper from "../lib/Helper"
import { useMediaQuery } from "../hooks/useMediaQuery"
import { api, overrideMethod } from "../lib/api"
import { LoadingScreen } from "./ui/Loading"

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

   const getBerita = async () => {
      setLoading(true)
      try {
        const data = await overrideMethod("GET", api).post("/berita", {
          start: 0,
          end: 5
        });
  
        setData(data.data.data)
      } catch {
        setData([])
        throw new Error("Failed to fetch kategori")
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    getBerita();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (data ? data.length : 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (data ? data.length : 1)) % (data ? data.length : 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      nextSlide()
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right
      prevSlide()
    }
  }

  if(loading) return <LoadingScreen/>

  return (
    <section className="hero-section">
      <div
        className="carousel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-items">
          {data && data.length != 0 ? data.map((item, index) => (
            <div onClick={() => handleRedirectDetail(item.id)} key={item.id} className={`carousel-item cursor-pointer ${index == currentIndex ? "active" : ""}`}>
              <img
                src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner || "/placeholder.svg"}
                alt={item.judul}
                width={1200}
                height={600}
                className="carousel-image object-cover"
              />
              <div className="carousel-caption">
                <div className="flex items-center gap-2">
                  {item.kategori && item.kategori.map((kat) => (
                    <span key={kat.id} className="carousel-category">{kat.kategori}</span>
                  ))}
                </div>
                <h2 className="carousel-title">{Helper.potongText(item.judul, 100)}</h2>
                <div className="carousel-meta">
                  <span>Oleh: {item.user.name}</span>
                  <span>{Helper.dateConvert(item.created_at)}</span>
                </div>
              </div>
            </div>
          )) : <div className="text-center w-full"><h1 className="font-bold mt-52 text-2xl">Data Artikel Tidak Ada</h1></div>}
        </div>

        {!isMobile && (
          <div className="carousel-controls">
            <div className="carousel-arrow prev" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </div>
            <div className="carousel-arrow next" onClick={nextSlide}>
              <ChevronRight size={24} />
            </div>
          </div>
        )}
        <div className="carousel-dots">
          {data && data.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${index == currentIndex ? "active" : ""}`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  )
}

