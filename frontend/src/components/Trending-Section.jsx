
import { useState, useEffect } from "react"
import { formatDateCreatedAt, potongText } from "../lib/Helper"
import { api, overrideMethod } from "../lib/api";
import { LoadingText } from "./ui/Loading";

export default function TrendingSection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      throw new Error("Failed to fetch berita")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getBerita();
  }, []);
  
  return (
    <section className="trending-section section">
      <div className="section-header">
        <h2 className="section-title font-bold">Berita Populer</h2>
        <a href="/berita  " className="view-all">
          Lihat Semua
        </a>
      </div>
        {!loading ? (
          data && data.length != 0 ? (
              <div className="trending-list">
                {data.map((item, key) => (
                  <a href={`/detailartikel/${item.id}`} key={item.id} className="trending-item">
                    <div className="trending-image">
                      <img
                        src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner || "/artikels/artikel.jpeg"}
                        alt={item.judul}
                        width={1000}
                        height={800}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="trending-content">
                      <div className="flex items-center gap-2">
                          {item.kategori && item.kategori.map((kat) => (
                            <span key={kat.id} className="trending-category font-medium">{kat.kategori}</span>
                          ))}
                        </div>
                      <h3 className="trending-title font-semibold">{potongText(item.judul, 40)}</h3>
                      <div className="trending-date">{formatDateCreatedAt(item.created_at)}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : <div className="text-center w-full"><h1 className="font-bold text-2xl">Data Artikel Tidak Ada</h1></div>
        ) : (
          <div className="flex justify-center">
            <LoadingText text={"Memuat Berita"}/>
          </div>
        )}
    </section>
  )
}

