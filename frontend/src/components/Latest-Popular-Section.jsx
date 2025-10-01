import { useState, useEffect } from "react"
import Helper from "../lib/Helper"
import { LoadingText } from "./ui/Loading"
import { overrideMethod, api } from "../lib/api"

export default function LatestPopularSection() {
  const [data, setData] = useState([])
  const [dataKategori, setDataKategori] = useState([])
  const [loading, setLoading] = useState(false);
  const [loadingKat, setLoadingKat] = useState(false);

  const getBerita = async () => {
    setLoading(true)
    try {
      const data = await overrideMethod("GET", api).post("/populer", {
        start: 0,
        end: 5
      });

      setData(data.data.data)
    } catch {
      setData([])
      throw new Error("Failed to fetch berita populer")
    } finally {
      setLoading(false)
    }
  }

  const getKategori = async () => {
    setLoadingKat(true)
    try {
      const data = await overrideMethod("GET", api).post("/kategori", {
        sort: "berita_count",
        start: 0,
        end: 5
      });

      setDataKategori(data.data.data)
    } catch {
      setDataKategori([])
      throw new Error("Failed to fetch kategori")
    } finally {
      setLoadingKat(false)
    }
  }

  useEffect(() => {
    getKategori();
    getBerita();
  }, [])
  
  return (
    <div className="two-column-layout">
      {/* Latest News */}
      <section className="latest-section section">
        <div className="section-header">
          <h2 className="section-title font-bold">Berita Populer</h2>
          <a href="/artikels" className="view-all">
            Lihat Semua
          </a>
        </div>
        <div className="flex items-center justify-center">
          
        </div>
        <div className="latest-list">
          {!loading ? (
            data && data.length != 0 ? data.map((item) => (
              <a href={`/detailartikel/${item.id}`} key={item.id} className="latest-item">
                <div className="latest-image">
                  <img
                    src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner || "/artikels/artikel.jpeg"}
                    alt={item.judul_artikel}
                    width={300}
                    height={200}
                    // layout="responsive"
                  />
                </div>
                <div className="latest-content">
                  <div className="flex gap-x-2">
                    {item.kategori.map((data, i) => (
                      <span key={i} className="news-category">{data.kategori}</span>
                    ))}
                  </div>
                  <h3 className="latest-title font-bold">{item.judul_artikel}</h3>
                  <p className="latest-excerpt">{Helper.potongText(Helper.hilangkanHTMLTAG(item.isi), 100)}</p>
                  <div className="news-meta">
                    <span>Oleh: {item.user?.name}</span>
                    <span>{Helper.dateConvert(item.created_at)}</span>
                  </div>
                </div>
              </a>
            )) : <div className="text-center w-full"><h1 className="font-bold text-xl">Data Artikel Tidak Ada</h1></div>
          ) : (
            <LoadingText text={"Memuat Berita"}/>
          )}
        </div>
      </section>

      {/* Popular News */}
      <section className="popular-section section">
        <div className="section-header">
          <h2 className="section-title font-bold">Kategori Populer</h2>
          <a href="/artikels" className="view-all">
            Lihat Semua
          </a>
        </div>
        <div className="popular-list">
          {!loadingKat ? (
            dataKategori && dataKategori.length != 0 ? dataKategori.map((item, index) => (
              <a href={`/detailartikel/${item.id}`} key={item.id} className="popular-item">
                <div className="popular-number">{(index + 1).toString().padStart(2, "0")}</div>
                <h3 className="popular-title font-semibold">{item.kategori}</h3>
              </a>
            )) : <div className="text-center w-full"><h1 className="font-bold text-xl">Data Artikel Tidak Ada</h1></div>
          ) : (
            <LoadingText text={"Memuat Kategori"}/>
          )}
        </div>
      </section>
    </div>
  )
}

