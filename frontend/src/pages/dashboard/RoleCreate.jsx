import { PenLine, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen, LoadingText } from "../../components/ui/Loading";
import NotFound from "../error/NotFound";
import { roleSchema } from "../../lib/zod";
import { api, overrideMethod } from "../../lib/api";

const RoleCreate = ({edit = false}) => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorInput, setErrorInput] = useState({}); 
    const [error, setError] = useState("");
    const [errorNotFound, setErrorNotFound] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);

    const getRoleData = async () => {
        try {
            const res = await api.get('/role/' + id)
            const data = res.data.data;
            setRole(data.role);
        } catch(err) {
            setErrorNotFound(true);
            console.log(err);
            throw new Error("Gagal mendapatkan role");
        } 
    }

    useEffect(() => {
        if(edit) {
            setLoadingPage(true);
            Promise.all([getRoleData()])
            .then(() => setLoadingPage(false))
            .catch(() => setLoadingPage(false))
        }
    }, [id])

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("role", role);

        const raw = {
            role,
        }
        const parsed = roleSchema.safeParse(raw);

        setError("");
        setErrorInput({});
        if(!parsed.success) {
            const fieldErrors = {};
            parsed.error.issues.forEach((err) => {
            const field = err.path[0];
            fieldErrors[field] = err.message;
            })

            setErrorInput(fieldErrors);

            setLoading(false);
            return;
        }

        try {
            if(edit) {
                await overrideMethod('PUT', api).post('/role/' + id, formData);
                alert("Role Berhasil Diedit");
            } else {
                await api.post('/role', formData);
                alert("Role Berhasil Ditambahkan");
            }

            navigate('/dashboard/role')
        } catch (err) {
            setError("Gagal menambahkan role")
            console.log(err);
            throw new Error("Gagal menambahkan role");
        } finally {
            setLoading(false)
        }
    }

    if(loadingPage) return <LoadingScreen/>
    if(errorNotFound) return <NotFound/> 
      
  return (
    <>
        {error && error != "" && (
        <div className="bg-red-600 rounded-lg py-2 px-4 flex gap-x-1 items-center mt-2">
          <X/> 
          <h3>{error}</h3>
        </div>
      )}
        <div className='bg-[rgb(32_31_31)] rounded-lg p-7 w-full mt-5'>
            <h1 className="text-2xl font-extrabold">{edit ? 'Edit Data Role' : 'Buat Data Role'}</h1>
            <form action="" onSubmit={handleSubmitForm} className="flex flex-col py-5">
            <div className="flex flex-col gap-2 mt-6">
                <label htmlFor="role">Role</label>
                <input name='role' value={role} placeholder="Masukkan Nama Role..." type="text" id='role' onChange={(e) => setRole(e.target.value)} 
                className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
                {errorInput.role && (
                    <span className={`text-red-600 text-[15px]`}>{errorInput.role}</span>
                )}
            </div>
            
            <div className="flex justify-end mt-10">
                <button disabled={loading} className={`bg-blue-500 px-3 py-2 justify-center rounded-lg flex gap-x-2 items-center whitespace-nowrap ${!loading ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`} type="submit">
                    {loading ? (<LoadingText text={"Mengirim Data"}/>) : edit ? (<><PenLine size={18}/> Simpan Perubahan</>) :
                    (<><Plus size={18}/> Tambah Data</>)}
                </button>
            </div>
            </form>
        </div>
    </>
  )
}

export default RoleCreate
