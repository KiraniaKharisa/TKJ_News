import { Eye } from 'lucide-react'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { formatDateCreatedAt, formatNumberLikes, potongText } from '../lib/Helper'
import { useEffect, useState } from 'react'
import { api, overrideMethod } from '../lib/api'
import { useParams } from 'react-router-dom'
import { LoadingScreen } from '../components/ui/Loading'
import NotFound from './error/NotFound'

const BeritaDetail = () => {
    const {id} = useParams();
    const [berita, setBerita] = useState({});
    const [beritaRekomendasi, setBeritaRekomendasi] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const getBerita = async () => {
        try {
            const res = await api.get('/berita/' + id)
            setBerita(res.data.data)
        } catch(err) {
            setError(true);
            console.log(err);
            throw new Error("Gagal mendapatkan berita");
        } 
    }

    const getRekomendasi = async() => {
        try {
            const res = await overrideMethod('GET', api).post('/berita', {
                start: 0,
                end: 10
            })
            setBeritaRekomendasi(res.data.data)
        } catch(err) {
            console.log(err);
            throw new Error("Gagal mendapatkan rekomendasi berita");
        }
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([getBerita(), getRekomendasi()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }, [id])

    if(loading) return <LoadingScreen/>
    if(error) return <NotFound/>

  return (
    <>
    <Header/>
    <div className="px-8 pt-8">
        <div className="mb-10">

            <img src={import.meta.env.VITE_BERITA_API_IMAGE + berita.banner} alt="" className="w-full h-[400px] rounded-lg object-cover" />
            <div className="flex justify-between items-center my-5">
                <div className="flex items-center gap-x-2">
                    <img src={berita.user?.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + berita.user.profil : '/default.jpg'} alt="Profil" className="size-12 rounded-full object-cover" />
                    <h3 className="font-bold text-md">{berita.user?.name}</h3>
                </div>
                <div className="flex items-center gap-x-5">
                    <h3 className="font-bold">
                        {berita.kategori && berita.kategori.map(k => k.kategori).join(", ")}
                    </h3>
                    <h3>|</h3>
                    <h3 className="font-bold text-gray-400">{formatDateCreatedAt(berita.created_at, {showDay: true, nameMonth: true})}</h3>
                    <div className="flex items-center gap-x-2">
                        <Eye/> 
                        <h5>{berita.views && formatNumberLikes(berita.views)}</h5>
                    </div>
                </div>
            </div>
            <h1 className="text-[26px] font-extrabold">{berita.judul}</h1>
        </div>

        <div className="flex gap-x-10">
            <div className="bg-blue-950 h-fit w-[400px] rounded-lg p-5 relative">
                <h3 className="text-xl font-bold mb-2">Baca Juga 5 Berita Terbaru</h3>
                {beritaRekomendasi.length != 0 ? (
                    beritaRekomendasi.map((item, i) => ( 
                        <a href="" key={i} className="cursor-pointer flex flex-col border-b-1 border-b-gray-300 py-2">
                            <p className="text-md text-gray-300 hover:underline hover:text-blue-500 transition">{potongText(item.judul, 85)}</p>
    
                            <div className="mt-3 flex items-center justify-between">
                                <h3 className="text-gray-300 font-semibold">{item.kategori[0].kategori}</h3>
                                <h3 className="text-gray-300">{formatDateCreatedAt(item.created_at)}</h3>
                            </div>
                        </a>
                    ))
                ) : (
                    <h5 className="text-center mt-3">Berita Tidak Ada</h5>
                )}
            </div>
            <div className="flex-1">
                {berita.isi}
            </div>
        </div>
    </div>
    <Footer/>
    </>
  )
}

export default BeritaDetail
