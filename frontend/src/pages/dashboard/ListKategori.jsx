import { useState, useEffect, useRef } from "react"
import { LoadingCircle, LoadingText } from '../../components/ui/Loading';
import { Search, Eye, PenLine, Trash, LucidePlus } from "lucide-react";
import { formatDateCreatedAt, formatNumberLikes, potongText } from "../../lib/Helper"
import { api, overrideMethod } from "../../lib/api";

const ListKategori = () => {
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(false)

  const getKategori = async () => {
    setLoading(true);
    setKategori([]);
    try {
      const res = await overrideMethod("GET", api).post("/kategori", {
        filters: search ? {kategori: search} : null,
      });

      setKategori(res.data.data);
    } catch (err) {
      console.log(err);
      setKategori([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      getKategori(search);
    } else {
      getKategori();
    }
  }, [search]);

  const handleDelete = async(e, id) => {
    e.preventDefault();
    const confirmation = confirm("Anda yakin ?")
    if(!confirmation) return;
    setLoading(true);

    try {
      await overrideMethod("DELETE", api).post('/kategori/' + id, {})
      alert("Berhasil delete kategori")
      await getKategori();
    } catch {
      alert("Gagal delete kategori")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">List Kategori Berita</h1>
      <p>Menampilkan tentang artikel anda</p>
      <div className="bg-[rgb(32_31_31)] px-5 py-3 my-5 rounded-lg shadow shadow-blue-500/25">
        <div className="flex justify-between">
            <h1 className="text-lg font-bold mt-2">List Kategori Berita</h1>
            <div className="flex gap-x-5">
                <a href="/dashboard/kategori/create" className="bg-blue-600 px-2 py-1 rounded flex gap-x-1 items-center text-[15px]"><LucidePlus/> Tambah Data</a>
                <div className="flex items-center gap-x-2 border-1 border-gray-200 px-2 py-1 rounded">
                    <Search size={18}/>
                    <input type="text" onChange={(e) => setSearch(e.target.value)} className="outline-none placeholder:text-[13px]" autoFocus placeholder="Cari Kategori Sesuai Kategori..." />
                </div>
            </div>
        </div>
        <table className="table mt-5">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-cell-header">No</th>
              <th className="table-cell-header">Kategori</th>
              <th className="table-cell-header">Total Berita</th>
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
              kategori && kategori.length != 0 ? (
                kategori.map((item, i) => (
                    <tr className="table-row">
                      <td className="table-cell-me text-center">{i + 1}</td>
                      <td className="table-cell-me">
                        <h3 className="font-semibold">{potongText(item.kategori, 70)}</h3>
                        <span className="text-sm text-gray-400">Dibuat Tanggal : {formatDateCreatedAt(item.created_at, {nameMonth: true})}</span>
                      </td>
                      <td className="table-cell-me text-center">{formatNumberLikes(item.berita_count)}</td>
                      <td className="table-cell-me">
                        <div className="flex justify-around">
                          <a className="text-sky-500" href={"/berita?kategori=" + item.id}><Eye size={18}/></a>
                          <a className="text-purple-500" href={"/dashboard/kategori/edit/" + item.id}><PenLine size={18}/></a>
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

export default ListKategori
