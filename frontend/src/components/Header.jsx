import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Search } from "lucide-react"
import { api, overrideMethod } from "../lib/api"
import { LoadingText } from "./ui/Loading"
import { useAuth } from "../context/AuthContext"
import { potongText } from "../lib/Helper"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState(0)
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  const [loading, setLoading] = useState(true)
  const [kategoriData, setKategoriData] = useState([])
  const {user} = useAuth();

  const getKategori = async () => {
    setLoading(true)
    try {
      const data = await overrideMethod("GET", api).post("/kategori", {
        start: 0,
        end: 5
      });

      setKategoriData(data.data.data)
    } catch {
      setKategoriData([])
      throw new Error("Failed to fetch kategori")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getKategori();
  }, []);

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">
              TKJ<span>aja</span>
            </a>
            <div className="search-bar">
              <form className="search-form">
                <input type="text" className="search-input bg-gray-800" placeholder="Cari berita..." />
                <button type="submit" className="search-button">
                    <Search size={20}/>
                </button>
              </form>
            </div>
            <div className="user-actions">
                  {user?.name ? (
                    <a href="/dashboard" className="btn btn-outline">
                      {`Halo, ${potongText(user.name, 20)}`}
                    </a>
                  ) : (
                    <a href="/login" className="btn btn-outline">
                      Masuk
                    </a>
                  )}
                  {/* <a href="/register" className="btn btn-primary">
                    Daftar
                  </a> */}
                {/* <a href="/dashboard" className="btn btn-primary">
                  Dashboard
                </a> */}
            </div>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <nav className={`main-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="container justify-center flex">
            {loading ? (
              <div className="flex h-[60px] items-center">
                <LoadingText text={"Memuat Data Kategori"}/>
              </div>
            ) : (
              <ul className="nav-list">
                <li className="nav-item">
                      <a
                        href={`/`}
                        className={`nav-link ${activeLink === 0 ? "active" : ""}`}
                        onClick={() => {
                          setActiveLink(0)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Beranda
                      </a>
                  </li>
              
                {kategoriData && kategoriData.length != 0 ? kategoriData.map((item) => (
                  <li key={item.id} className="nav-item">
                    <a
                      href={`/berita?kategori=${item.id}`}
                      className={`nav-link ${activeLink === item.id ? "active" : ""}`}
                      onClick={() => {
                        setActiveLink(item.id)
                        setMobileMenuOpen(false)
                      }}
                    >
                      {item.kategori}
                    </a>
                  </li>
                )) : ""}
              </ul> 
            )}
        </div>
      </nav>
    </header>
  )
}

