import { useState, useEffect, useRef } from "react"
import { LoadingText } from '../../components/ui/Loading';
import { Search, Eye, PenLine, Trash, LucidePlus } from "lucide-react";
import { formatDateCreatedAt, formatNumberLikes, potongText } from "../../lib/Helper"
import { useAuth } from "../../context/AuthContext";
import { api, overrideMethod } from "../../lib/api";

export default function Beritaku() {
  const {user} = useAuth();
  const [search, setSearch] = useState('');
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(false)

  const getBerita = async () => {
    setLoading(true);
    setBerita([]);
    try {
      const res = await overrideMethod("GET", api).post("/berita", {
        filters: search ? {judul: search} : null,
        fixfilters: user ? {user_id: user.id} : null
      });

      setBerita(res.data.data);
    } catch (err) {
      console.log(err);
      setBerita([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      getBerita(search);
    } else {
      getBerita();
    }
  }, [search]);

  const handleDelete = async(e, id) => {
    e.preventDefault();
    const confirmation = confirm("Anda yakin ?")
    if(!confirmation) return;
    setLoading(true);

    try {
      await overrideMethod("DELETE", api).post('/berita/' + id, {})
      alert("Berhasil delete berita")
      await getBerita();
    } catch {
      alert("Gagal delete berita")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Beritaku</h1>
      <p>Menampilkan tentang berita anda</p>
      <div className="bg-[rgb(32_31_31)] px-5 py-3 my-5 rounded-lg shadow shadow-blue-500/25">
        <div className="flex justify-between">
            <h1 className="text-lg font-bold mt-2">List Berita Kamu</h1>
            <div className="flex gap-x-5">
                <a href="/dashboard/beritaku/create" className="bg-blue-600 px-2 py-1 rounded flex gap-x-1 items-center text-[15px]"><LucidePlus/> Tambah Data</a>
                <div className="flex items-center gap-x-2 border-1 border-gray-200 px-2 py-1 rounded">
                    <Search size={18}/>
                    <input onChange={(e) => setSearch(e.target.value)} type="text" className="outline-none placeholder:text-[13px]" autoFocus placeholder="Cari Beritamu Sesuai Judul..." />
                </div>
            </div>
        </div>
        <table className="table mt-5">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-cell-header">No</th>
              <th className="table-cell-header">Berita</th>
              <th className="table-cell-header">Views</th>
              <th className="table-cell-header">Status</th>
              <th className="table-cell-header">Aksi</th>
            </tr>
          </thead>
          <tbody>

            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex justify-center items-center py-3 font-bold"><LoadingText text={"Memuat Data..."}/></div>
                </td>
              </tr>
            ) : (
              berita && berita.length != 0 ? (
                berita.map((item, i) => (
                  <tr className="table-row" key={i}>
                    <td className="table-cell-me text-center">{i + 1}</td>
                    <td className="table-cell-me flex items-center gap-x-2">
                      <img src={import.meta.env.VITE_BERITA_API_IMAGE + item.banner} alt="" className="size-12 rounded object-cover" />
                      <div>
                        <h3 className="font-semibold">{potongText(item.judul , 70)}</h3>
                        <span className="text-sm text-gray-400">
                          {item.kategori.map(k => k.kategori).join(', ')} - {formatDateCreatedAt(item.created_at, {nameMonth: true})}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell-me text-center">{formatNumberLikes(item.views)}</td>
                    <td className="table-cell-me text-center">{item.published ? "Publik" : "Draft"}</td>
                    <td className="table-cell-me">
                      <div className="flex justify-around">
                        <a className="text-sky-500" href={"/berita/" + item.id}><Eye size={18}/></a>
                        <a className="text-purple-500" href={"/dashboard/beritaku/edit/" + item.id}><PenLine size={18}/></a>
                        <a className="text-red-500" href="" onClick={(e) => handleDelete(e, item.id)}><Trash size={18}/></a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
              <tr>
                <td colSpan={4}>
                  <div className="flex justify-center items-center py-3 font-bold">Data Tidak Ditemukan</div>
                </td>
              </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}