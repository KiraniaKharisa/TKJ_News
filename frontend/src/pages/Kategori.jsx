import { Search, ScrollText } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { potongText } from "../lib/Helper"
import { useEffect, useState } from "react"
import { api, overrideMethod } from "../lib/api"
import { LoadingText } from "../components/ui/Loading"

const Kategori = () => {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const getKategori = async (search = null) => {
    setLoading(true);
    setKategori([]);
    try {
      const res = await overrideMethod("GET", api).post("/kategori", {
        start: 0,
        end: 5,
        filters: search ? { kategori: search } : null,
      });
      setKategori(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(search && search != "") {
      getKategori(search);
    } else {
      getKategori(null);
    }
  }, [search])

  return (
    <div>
      <Header />
      <main className="main-content pt-10">
        <div className="container">
            <h1 className="text-center text-3xl font-bold">Cari Kategori Dari Berita Favoritmu Disini</h1>
            <p className="mb-6 text-center">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, hic! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita, facere?</p>
            <div className="search-bar">
                <div className="search-form items-center px-3">
                  <input type="text" className="search-input" onChange={(e) => setSearch(e.target.value)} placeholder="Cari kategori sesuai nama..." />
                  <Search size={20}/>
                </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center mt-5"><LoadingText text={"Memuat data kategori"}/></div>
            ) : (
              kategori && kategori.length != 0 ? (
                <div className="grid mt-10 grid-cols-5 justify-items-center items-center gap-10">
                  {kategori.map((item, i) => (
                      <a href={"/berita?kategori=" + item.id} key={i} className="cursor-pointer bg-blue-950 w-[220px] px-5 py-5 rounded-lg shadow shadow-gray-800">
                        <h3 className="text-[20px] font-bold">{potongText(item.kategori, 15)}</h3>
                        <p className="flex items-center text-[15px] mt-2 gap-x-2"><ScrollText/> Jumlah Berita : {item.berita_count}</p>
                      </a>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center mt-5">Data Kategori Tidak Ditemukan</div>
              )
            )}
        </div>
    </main>
    <Footer />
    </div>
  )
}

export default Kategori