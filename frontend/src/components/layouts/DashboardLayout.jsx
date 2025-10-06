import { useEffect, useState } from "react";
import Sidebar from "./Sidebar"
import { Outlet } from 'react-router-dom'
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
  const [isMobile, setIsMobile] = useState(false)
  const {user} = useAuth();

  useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      checkIfMobile()
      window.addEventListener('resize', checkIfMobile)
      
      return () => window.removeEventListener('resize', checkIfMobile)
    }, [])

  return (
    <div className='flex min-h-screen bg-[#111111]'>
        <Sidebar/>
        <div className="flex-1 relative">
          {!isMobile && (
            <div className="w-full h-[70px] z-[99] bg-[rgb(32_31_31)] sticky top-0 flex dahsboard-padding-important items-center justify-between">
                <h2 className="text-lg font-bold">Selamat Datang, {user.name}</h2>
                <div className="flex items-center gap-3">
                  <span>{user.name}</span>
                  <img src={user.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + user.profil : "/default.jpg"} alt="" className="size-12 rounded-full" />
                </div>
            </div>
          )}
          <div className={`dahsboard-padding-important ${isMobile ? 'mt-18' : 'mt-0'}`}>
            <Outlet/>
          </div>
        </div>
    </div>
  )
}

export default DashboardLayout
