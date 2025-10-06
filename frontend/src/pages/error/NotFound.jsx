import { MoveLeft } from "lucide-react"

const NotFound = () => {
  return (
    <div className='flex justify-center items-center flex-col h-screen'>    
        <h1 className="text-[150px] font-extrabold">404</h1>
        <h3 className='text-2xl font-semibold'>Halaman Atau Data Tidak Ditemukan</h3>
        <a href="/" className='flex items-center gap-x-2 mt-5 hover:text-blue-500'><MoveLeft/> Kembali Ke Beranda</a>
    </div>
  )
}

export default NotFound
