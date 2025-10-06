import React, { useEffect, useRef, useState } from "react"
import { ChevronDown, ImagePlus, PenLine, Plus, X } from 'lucide-react';
import { api, overrideMethod } from "../../lib/api";
import { beritaSchema, beritaSchemaEdit } from "../../lib/zod";
import { LoadingScreen, LoadingText } from "../../components/ui/Loading";
import { useNavigate, useParams } from "react-router-dom"
import NotFound from '../error/NotFound'

const MAX_KATEGORI = 3;

const BeritaCreate = ({edit = false}) => {
  const {id} = useParams();
  const navigate = useNavigate();
  const refBanner = useRef(null);
  const [form, setForm] = useState({judul: '', isi: '', kategori: [], published: false, banner: ''});
  const [kategori, setKategori] = useState([]);
  const [loadingKat, setLoadingKat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKat, setSelectedKat] = useState([]);
  const [searchKat, setSearchKat] = useState("");
  const [openPublish, setOpenPublish] = useState(false);
  const [publish, setPublish] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorInput, setErrorInput] = useState({}); 
  const [error, setError] = useState("");
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  const getBerita = async () => {
      try {
          const res = await api.get('/berita/' + id)
          const data = res.data.data;
          setForm({
            judul: data.judul,
            isi: data.isi,
            published: data.published == 1 ? true : false
          })
          setPreviewImage(import.meta.env.VITE_BERITA_API_IMAGE + data.banner);
          if(data.kategori && data.kategori.length > 0) {
            setSelectedKat(data.kategori);
          }
          setPublish(data.published == 1 ? true : false);
      } catch(err) {
          setErrorNotFound(true);
          console.log(err);
          throw new Error("Gagal mendapatkan berita");
      } 
  }

  useEffect(() => {
    if(edit) {
      setLoadingPage(true);
        Promise.all([getBerita()])
        .then(() => setLoadingPage(false))
        .catch(() => setLoadingPage(false))
    }
  }, [id])

  const getKategori = async (search) => {
    setLoadingKat(true);
    setKategori([])
    try {
      const res = await overrideMethod("GET", api).post('/kategori', {
        start: 0,
        end: 5,
        filters: search ? { "kategori": search } : null,
      })

      setKategori(res.data.data);
    } catch (err) {
      console.log(err);;
      throw new Error("Gagal mendapatkan kategori");
    } finally {
      setLoadingKat(false);
    }
  }

  useEffect(() => {
    if(searchKat) {
      getKategori(searchKat);
    } else {
      getKategori(null);
    }
  }, [searchKat])

  const handleSelectKat = (kat) => {
    if(selectedKat.find((s) => s.id == kat.id)) return;
    if(selectedKat.length >= MAX_KATEGORI) {
      // set error
      return;
    }
    setSelectedKat([...selectedKat, kat])
  }

  const handleRemoveKat = (id) => {
    setSelectedKat(selectedKat.filter((s) => s.id != id));
  }

  const handleSelectImage = () => {
    if(refBanner.current) {
      refBanner.current.click();
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
    const file = refBanner.current.files?.[0];
    if(file) formData.append("banner", file);
    formData.append("judul", form.judul);
    formData.append("isi", form.isi);
    formData.append("published", publish ? 1 : 0);
    selectedKat.forEach((kat) => {
      formData.append("kategori[]", kat.id);
    });

    const raw = {
        judul: form.judul,
        isi: form.isi,
        published: publish,
        kategori: selectedKat.map((kat) => kat.id),
        ...(file ? {banner: file} : {}),
    }

    let parsed;
    if(edit) {
      parsed = beritaSchemaEdit.safeParse(raw);
    } else {
      parsed = beritaSchema.safeParse(raw);
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
        await overrideMethod('PUT', api).post('/berita/' + id, formData);
        alert("Berita Berhasil Diedit");
      } else {
        await api.post('/berita', formData);
        alert("Berita Berhasil Ditambahkan");
      }

        navigate('/dashboard/beritaku')
    } catch (err) {
        setError("Gagal menambahkan berita")
        console.log(err);
        throw new Error("Gagal menambahkan berita");
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
          <h1 className="text-2xl font-extrabold">{edit ? 'Edit Data Berita' : 'Buat Data Berita'}</h1>
          <form action="" onSubmit={handleSubmitForm} className="flex flex-col py-5">
            <input type="file" className="hidden" ref={refBanner} onChange={handleChangeImage} />
            <div onClick={handleSelectImage} className="relative flex flex-col border-2 border-dashed border-gray-200 rounded overflow-hidden w-full h-[300px] justify-center items-center cursor-pointer group">
              {previewImage ? (
                <div className="absolute top-0 left-0 w-full h-[300px]">
                  <img src={previewImage} alt="" className="w-full h-full object-cover" />
                  <div className="bg-black/70 opacity-0 transition duration-500 group-hover:opacity-100 absolute top-0 left-0 w-full h-full flex items-center justify-center">Klik Untuk Mengganti Image</div>
                </div>
              ) : (
                <>
                  <ImagePlus size={80} className="mb-3"/>
                  <h3 className="text-xl">Tambahkan Banner Berita</h3>
                  <p className="text-sm mt-2 text-gray-400">Image harus berektensi jpg, png, jpeg, webp</p>
                </>
              )}
            </div>
            {errorInput.banner && (
              <span className={`text-red-600 text-[15px] mt-2`}>{errorInput.banner}</span>
            )}
            <div className="flex flex-col gap-2 mt-6">
              <label htmlFor="judul">Judul Berita</label>
              <input name='judul' placeholder="Masukkan Judul Berita..." type="text" id='judul' onChange={handleChange} value={form.judul} 
              className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
              {errorInput.judul && (
                  <span className={`text-red-600 text-[15px]`}>{errorInput.judul}</span>
              )}
            </div>
            <div>
              <div className="flex flex-col gap-2 mt-3 mb-2">
                <label htmlFor="kategori">Pilih Kategori</label>
                {selectedKat.length != 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedKat.map((kat) => (
                      <div
                        key={kat.id}
                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-full flex items-center gap-1 text-sm"
                      >
                        {kat.kategori}
                        <button
                          type="button"
                          className="text-red-500 font-bold cursor-pointer"
                          onClick={() => handleRemoveKat(kat.id)}
                        >
                          <X/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input search */}
                <input
                  type="text"
                  placeholder={
                    selectedKat.length >= MAX_KATEGORI
                      ? "Maksimal Kategori Tercapai"
                      : "Cari Dan Pilih Kategori..."
                  }
                  disabled={selectedKat.length >= MAX_KATEGORI}
                  value={searchKat}
                  id="kategori"
                  onChange={(e) => setSearchKat(e.target.value)}
                  className={`border-1 rounded-xl placeholder:text-[15px] p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}
                />

                {/* Dropdown kategori */}
                {loadingKat ? (
                  <p className="text-sm text-gray-400 mt-1">Memuat...</p>
                ) : kategori.length > 0 ? (
                  <ul className="border rounded-lg mt-1 bg-slate-800 overflow-hidden shadow divide-y divide-gray-700">
                    {kategori.map((kat) => (
                      <li
                        key={kat.id}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700"
                        onClick={() => handleSelectKat(kat)}
                      >
                        {kat.kategori}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">Tidak ada kategori</p>
                )}
              </div>
              {errorInput.kategori && (
                  <span className={`text-red-600 text-[15px]`}>{errorInput.kategori}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <label htmlFor="isi">Isi Berita</label>
              <input name='isi' value={form.isi} placeholder="Masukkan Isi Berita..." type="text" id='isi' onChange={handleChange} 
              className={`border-1 placeholder:text-[15px] rounded-xl p-3 bg-transparent outline-none ${false ? 'border-red-500 placeholder-red-500 text-red-500 focus:border-red-500' : 'border-gray-400 placeholder-gray-400 text-gray-100'}`}/>
              {errorInput.isi && (
                  <span className={`text-red-600 text-[15px]`}>{errorInput.isi}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <p>Publikasi Berita</p>
              <div className="relative z-[10] w-full">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenPublish(!openPublish)
                  }}
                  className="w-full border cursor-pointer border-gray-300 rounded-xl p-3 text-left text-sm"
                >
                  {!publish ? "Draft" : "Publik Berita"}
                  <ChevronDown className="inline float-right mt-1" />
                </button>

                {openPublish && (
                  <ul className="absolute w-full mt-2 border border-gray-300 rounded-md overflow-hidden bg-slate-800 shadow divide-y divide-gray-700">
                    {["Draft", "Publik Berita"].map((opt) => (
                      <li
                        key={opt}
                        onClick={() => {
                          let mode = opt == "Draft" ? false : true
                          setPublish(mode);
                          setOpenPublish(false);
                        }}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-700"
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errorInput.published && (
                  <span className={`text-red-600 text-[15px]`}>{errorInput.published}</span>
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

export default BeritaCreate