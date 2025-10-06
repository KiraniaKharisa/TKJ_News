import { useEffect, useRef, useState } from "react";
import { api, overrideMethod } from "../../lib/api";
import { ImagePlus, PenLine, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingScreen, LoadingText } from "../../components/ui/Loading";
import NotFound from "../error/NotFound";
import { userSchema, userSchemaEdit } from "../../lib/zod";

const UserCreate = ({edit = false}) => {
    const {id} = useParams();
    const navigate = useNavigate();
    const refProfil = useRef(null);
    const [form, setForm] = useState({name: '', email: '', role_id: 0, profil: ''});
    const [role, setRole] = useState([]);
    const [loadingRole, setLoadingRole] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchRole, setSearchRole] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [errorInput, setErrorInput] = useState({}); 
    const [error, setError] = useState("");
    const [errorNotFound, setErrorNotFound] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);

    const getUserData = async () => {
        try {
            const res = await api.get('/user/' + id)
            const data = res.data.data;
            setForm({
                name: data.name,
                email: data.email,
                role_id: data.role.id,
            })
            setSearchRole(data.role.role);
            setPreviewImage(data.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + data.profil : '/default.jpg');
        } catch(err) {
            setErrorNotFound(true);
            console.log(err);
            throw new Error("Gagal mendapatkan user");
        } 
    }

    useEffect(() => {
        if(edit) {
            setLoadingPage(true);
            Promise.all([getUserData()])
            .then(() => setLoadingPage(false))
            .catch(() => setLoadingPage(false))
        }
    }, [id])

    const getRole = async (search) => {
        setLoadingRole(true);
        setRole([])
        try {
            const res = await overrideMethod("GET", api).post('/role', {
            start: 0,
            end: 5,
            filters: search ? { "role": search } : null,
            })

            setRole(res.data.data);
        } catch (err) {
            console.log(err);;
            throw new Error("Gagal mendapatkan kategori");
        } finally {
            setLoadingRole(false);
        }
    }

    useEffect(() => {
        if(searchRole) {
            getRole(searchRole);
        } else {
            getRole(null);
        }
    }, [searchRole])

    const handleSelectImage = () => {
        if(refProfil.current) {
            refProfil.current.click();
        }
    }

    const handleChangeImage = (e) => {
        const file = e.target.files?.[0];
        if(file) setPreviewImage(URL.createObjectURL(file))
    }
    
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        const file = refProfil.current.files?.[0];
        if(file) formData.append("profil", file);
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("role_id", form.role_id);
        if(!edit) {
            formData.append("password", form.password);
            formData.append("password_confirmation", form.password_confirmation);
        }
    
        const raw = {
            name: form.name,
            email: form.email,
            role_id: form.role_id,
            ...(file ? {profil: file} : {}),
            ...(edit ? {} : {password: form.password, password_confirmation: form.password_confirmation})
        }
    
        let parsed;
        if(edit) {
            parsed = userSchemaEdit.safeParse(raw);
        } else {
            parsed = userSchema.safeParse(raw);
        }
    
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
                await overrideMethod('PUT', api).post('/user/' + id, formData);
                alert("User Berhasil Diedit");
            } else {
                await api.post('/user', formData);
                alert("User Berhasil Ditambahkan");
            }
    
            navigate('/dashboard/user')
        } catch (err) {
            setError("Gagal menambahkan user")
            console.log(err);
            throw new Error("Gagal menambahkan user");
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
            <h1 className="text-2xl font-extrabold">{edit ? 'Edit Data User' : 'Buat Data User'}</h1>
            <form action="" onSubmit={handleSubmitForm} className="flex flex-col py-5">
            <input type="file" className="hidden" ref={refProfil} onChange={handleChangeImage} />
            <div onClick={handleSelectImage} className="relative flex flex-col border-2 border-dashed border-gray-200 rounded-full overflow-hidden w-[150px] h-[150px] justify-center items-center cursor-pointer group">
                {previewImage ? (
                <div className="absolute top-0 left-0 w-full h-[150px]">
                    <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    <div className="bg-black/70 opacity-0 transition duration-500 group-hover:opacity-100 absolute top-0 left-0 w-full h-full flex items-center justify-center text-center text-[13px]">Klik Untuk Mengganti Image</div>
                </div>
                ) : (
                <>
                    <ImagePlus size={18} className="mb-3"/>
                    <h3 className="text-md text-center">Foto Profil</h3>
                    <p className="text-[12px] mt-2 text-gray-400 text-center px-2">Berektensi jpg, png, jpeg, webp</p>
                </>
                )}
            </div>
            {errorInput.profil && (
                <span className={`text-red-600 text-[15px] mt-2`}>{errorInput.profil}</span>
            )}
            <div className="flex flex-col gap-2 mt-6">
                <label htmlFor="name">Nama</label>
                <input name='name' value={form.name} placeholder="Masukkan Nama User..." type="text" id='name' onChange={handleChange} 
                className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
                {errorInput.name && (
                    <span className={`text-red-600 text-[15px]`}>{errorInput.name}</span>
                )}
            </div>
            <div className="flex flex-col gap-2 mt-3">
                <label htmlFor="email">Email</label>
                <input name='email' value={form.email} placeholder="Masukkan email..." type="text" id='email' onChange={handleChange} 
                className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
                {errorInput.email && (
                    <span className={`text-red-600 text-[15px]`}>{errorInput.email}</span>
                )}
            </div>
            <div>
                <div className="flex flex-col gap-2 mt-3 mb-2">
                <label htmlFor="role">Pilih Role</label>

                {/* Input search */}
                <input
                    type="text"
                    placeholder="Cari Dan Pilih Role..."
                    value={searchRole}
                    id="role"
                    onChange={(e) => setSearchRole(e.target.value)}
                    className={`border-1 rounded-xl placeholder:text-[15px] p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}
                />

                {/* Dropdown kategori */}
                {loadingRole ? (
                    <p className="text-sm text-gray-400 mt-1">Memuat...</p>
                ) : role.length > 0 ? (
                    <ul className="border rounded-lg mt-1 bg-slate-800 overflow-hidden shadow divide-y divide-gray-700">
                    {role.map((r) => (
                        <li
                        key={r.id}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700 capitalize"
                        onClick={() => {
                            setForm({...form, role_id: r.id});
                            setSearchRole(r.role)
                        }}
                        >
                        {r.role}
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400 mt-1">Tidak ada role</p>
                )}
                </div>
                {errorInput.role_id && (
                    <span className={`text-red-600 text-[15px]`}>{errorInput.role_id}</span>
                )}
            </div>
            {!edit && (
                <>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="password">Password</label>
                        <input name='password' placeholder="Masukkan password..." type="password" id='password' onChange={handleChange} 
                        className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
                        {errorInput.password && (
                            <span className={`text-red-600 text-[15px]`}>{errorInput.password}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="password_confirmation">Konfirmasi Password</label>
                        <input name='password_confirmation' placeholder="Masukkan Konfirmasi Password..." type="password" id='password_confirmation' onChange={handleChange} 
                        className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
                        {errorInput.password_confirmation && (
                            <span className={`text-red-600 text-[15px]`}>{errorInput.password_confirmation}</span>
                        )}
                    </div>
                </>
            )}
            
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

export default UserCreate
