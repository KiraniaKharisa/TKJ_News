import { Eye, Search } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { formatNumberLikes, hilangkanHTML, potongText } from "../lib/Helper"
import { useEffect, useState } from "react"
import { api, overrideMethod } from "../lib/api"
import { LoadingText } from "../components/ui/Loading"
import { useSearchParams, useNavigate } from "react-router-dom"

const Berita = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    judul: "",
    kategori_id: null,
  });

  const [kategori, setKategori] = useState([]);
  const [loadingKat, setLoadingKat] = useState(false);
  const [loadingBerita, setLoadingBerita] = useState(false);
  const [berita, setBerita] = useState([]);
  const [searchKat, setSearchKat] = useState(""); // untuk input kategori
  const navigate = useNavigate();

  // 🔎 ambil kategori
  const getKategori = async (search = null) => {
    setLoadingKat(true);
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
      setLoadingKat(false);
    }
  };

  // 🔎 ambil berita (judul + kategori)
  const getBerita = async () => {
    setLoadingBerita(true);
    setBerita([]);
    try {
      const activeFilters = {};
      if (filters.judul) activeFilters.judul = filters.judul;
      if (filters.kategori_id) activeFilters.kategori_id = filters.kategori_id;

      const res = await overrideMethod("GET", api).post("/berita", {
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : null,
      });

      setBerita(res.data.data);
    } catch (err) {
      console.log(err);
      setBerita([]);
    } finally {
      setLoadingBerita(false);
    }
  };

  // efek saat kategori dicari
  useEffect(() => {
    if (searchKat) {
      getKategori(searchKat);
    } else {
      getKategori();
    }
  }, [searchKat]);

  // efek saat filter judul/kategori berubah
  useEffect(() => {
    getBerita();
  }, [filters]);

  const handleSelectKat = (kat, id) => {
    setSearchKat(kat);
    // setFilters((prev) => ({ ...prev, kategori_id: id }));
    navigate("/berita?kategori=" + id);
  };

  const handleSearchJudul = (e) => {
    setFilters((prev) => ({ ...prev, judul: e.target.value }));
  };

  useEffect(() => {
    const kategoriParam = searchParams.get("kategori");
    if (kategoriParam) {
      setFilters((prev) => ({ ...prev, kategori_id: kategoriParam }));
    }

    if (kategoriParam) {
      setLoadingKat(true);
      overrideMethod("GET", api).post("/kategori", {fixfilters: {id: kategoriParam}})
      .then(res => {
        if(res.data.data.length > 0 && res.data.data) {
          setSearchKat(res.data.data[0].kategori);
        }
      }).catch((err) => {
        console.log(err);
        setSearchKat("Kategori Tidak Ditemukan");
      }).finally(() => {
        setLoadingKat(false);
      })
    }
  }, [searchParams]);

  return (
    <div>
      <Header />
      <main className="main-content pt-10">
        <div className="container">
          <h1 className="text-center text-3xl font-bold">
            Cari Info Dan Berita Favoritmu Disini
          </h1>
          <p className="mb-6 text-center">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, hic! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita, facere?
          </p>

          {/* Search bar */}
          <div className="search-bar flex gap-x-4">
            {/* Pencarian judul */}
            <div className="flex-1 relative border-1 border-gray-400 rounded-lg">
              <input
                type="text"
                value={filters.judul}
                onChange={handleSearchJudul}
                className="search-input w-full border rounded-xl py-2 px-3 bg-transparent text-gray-100 placeholder-gray-400 border-gray-400 outline-none"
                placeholder="Cari berita sesuai judul..."
              />
              <Search size={20} className="absolute right-3 top-3 text-gray-400" />
            </div>

            {/* Pencarian kategori */}
            <div className="w-[300px] relative">
              <input
                type="text"
                placeholder="Cari Dan Pilih Kategori..."
                value={searchKat}
                onChange={(e) => setSearchKat(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key == "Enter") {
                    if(e.target.value == "") {
                      setFilters((prev) => ({ ...prev, kategori_id: null }));
                    }
                  }
                }}
                className="border-1 rounded-xl placeholder:text-[15px] py-[8px] px-[15px] w-full bg-transparent outline-none border-gray-400 placeholder-gray-400 text-gray-100"
              />

              {/* Dropdown kategori */}
              {searchKat && (
                <>
                  {loadingKat ? (
                    <p className="text-sm text-gray-400 mt-1 absolute">Memuat...</p>
                  ) : kategori.length > 0 ? (
                    <ul className="border absolute w-full rounded-lg mt-1 bg-slate-800 overflow-hidden shadow divide-y divide-gray-700">
                      {kategori.map((kat) => (
                        <li
                          key={kat.id}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700"
                          onClick={() => handleSelectKat(kat.kategori, kat.id)}
                        >
                          {kat.kategori}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">Tidak ada kategori</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* List Berita */}
          {loadingBerita ? (
            <div className="flex items-center justify-center text-xl font-bold mt-10">
              <LoadingText text={"Memuat Data Berita..."} />
            </div>
          ) : berita.length > 0 ? (
            <div className="grid mt-10 grid-cols-3 justify-items-center items-center gap-10">
              {berita.map((item, id) => (
                <a
                  href={`/berita/${item.id}`}
                  key={id}
                  className="cursor-pointer bg-blue-950 w-[350px] px-3 py-5 rounded-lg shadow shadow-gray-800"
                >
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner}
                      alt=""
                      className="h-[150px] w-full object-cover"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="flex gap-3 my-3">
                      {item.kategori.map((k) => (
                        <div
                          key={k.id}
                          className="bg-gray-300 rounded-full py-[.5] px-4 text-gray-800 text-sm font-semibold"
                        >
                          {k.kategori}
                        </div>
                      ))}
                    </div>
                    <h3 className="font-bold text-xl mb-2">
                      {potongText(item.judul, 30)}
                    </h3>
                    <p>{potongText(hilangkanHTML(item.isi), 100)}</p>
                  </div>

                  <div className="flex justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-[50px] h-[50px] rounded-full object-cover"
                        src={item.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + item.profil : '/default.jpg'}
                        alt=""
                      />
                      <h6 className="font-semibold text-[16px]">
                        {potongText(item.user.name, 20)}
                      </h6>
                    </div>
                    <div className="flex items-center gap-2 px-5">
                      <div className="flex items-center gap-1 cursor-pointer">
                        <Eye size={15} />
                        <p className="text-sm">{formatNumberLikes(item.views)}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-xl font-bold mt-10">
              Tidak Ada Data Berita
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Berita;
