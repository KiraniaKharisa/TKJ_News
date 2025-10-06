import { useState, useEffect } from "react"
import { LoadingText } from '../../components/ui/Loading';
import { Search, Eye, PenLine, Trash, LucidePlus } from "lucide-react";
import { formatDateCreatedAt, potongText } from "../../lib/Helper"
import { api, overrideMethod } from "../../lib/api";

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false)

  const getUser = async () => {
    setLoading(true);
    setUserData([]);
    try {
      const res = await overrideMethod("GET", api).post("/user", {
        filters: search ? {name: search} : null
      });

      setUserData(res.data.data);
    } catch (err) {
      console.log(err);
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      getUser(search);
    } else {
      getUser();
    }
  }, [search]);

  const handleDelete = async(e, id) => {
    e.preventDefault();
    const confirmation = confirm("Anda yakin ?")
    if(!confirmation) return;
    setLoading(true);

    try {
      await overrideMethod("DELETE", api).post('/user/' + id, {})
      alert("Berhasil delete user")
      await getUser();
    } catch {
      alert("Gagal delete user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p>Menampilkan tentang management pengguna di website</p>
      <div className="bg-[rgb(32_31_31)] px-5 py-3 my-5 rounded-lg shadow shadow-blue-500/25">
        <div className="flex justify-between">
            <h1 className="text-lg font-bold mt-2">List Pengguna Website</h1>
            <div className="flex gap-x-5">
                <a href="/dashboard/user/create" className="bg-blue-600 px-2 py-1 rounded flex gap-x-1 items-center text-[15px]"><LucidePlus/> Tambah Data</a>
                <div className="flex items-center gap-x-2 border-1 border-gray-200 px-2 py-1 rounded">
                    <Search size={18}/>
                    <input type="text" onChange={(e) => setSearch(e.target.value)} className="outline-none placeholder:text-[13px]" autoFocus placeholder="Cari User Sesuai Nama..." />
                </div>
            </div>
        </div>
        <table className="table mt-5">
          <thead className="table-header">
            <tr className="table-row">
              <th className="table-cell-header">No</th>
              <th className="table-cell-header">User</th>
              <th className="table-cell-header">Role</th>
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
              userData && userData.length != 0 ? (
                userData.map((item, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell-me text-center">{i +1}</td>
                    <td className="table-cell-me flex items-center gap-x-2">
                      <img src={item.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + item.profil : '/default.jpg'} alt="" className="size-12 rounded object-cover" />
                      <div>
                        <h3 className="font-semibold">{potongText(item.name, 70)}</h3>
                        <span className="text-sm text-gray-400">Join Mulai : {formatDateCreatedAt(item.created_at, {nameMonth: true, showDay: true})}</span>
                      </div>
                    </td>
                    <td className="table-cell-me text-center capitalize">{item.role.role}</td>
                    <td className="table-cell-me">
                      <div className="flex justify-around">
                        <a className="text-purple-500" href={"/dashboard/user/edit/" + item.id}><PenLine size={18}/></a>
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

export default UserManagement
