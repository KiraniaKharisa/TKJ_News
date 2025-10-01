import { ArrowLeft } from "lucide-react"
import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-back-link">
        <a href="/">
          <ArrowLeft size={20} /> Kembali ke Beranda
        </a>
      </div>
      <div className="auth-forms"><Outlet/></div>
    </div>
  )
}

