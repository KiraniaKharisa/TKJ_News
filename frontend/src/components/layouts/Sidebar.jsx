import { 
  ArrowLeft, 
  DoorOpen, 
  Home, 
  Newspaper, 
  Users, 
  UserCog, 
  Boxes, 
  Menu, 
  ScrollText
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { NavLink, useNavigate } from "react-router-dom"

export default function Sidebar() {
  const router = useNavigate();
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isHomeLinkHovered, setIsHomeLinkHovered] = useState(false)
  const {logout, user} = useAuth();
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} />, isadmin: false, href: "/dashboard" },
    // { id: "editProfile", label: "Edit Profil", icon: <UserPen size={20}/>, isadmin: false, href: "#" },
    { id: "beritaku", label: "Beritaku", icon: <Newspaper size={20} />, isadmin: false, href: "/dashboard/beritaku" },
    { id: "datauser", label: "Management User", icon: <Users size={20} />, isadmin: true, href: "/dashboard/user" },
    { id: "datarole", label: "Management Role", icon: <UserCog size={20} />, isadmin: true, href: "/dashboard/role" },
    { id: "dataartikel", label: "List Berita", icon: <ScrollText size={20} />, isadmin: true, href: "/dashboard/berita" },
    { id: "datakategori", label: "List Kategori", icon: <Boxes size={20} />, isadmin: true, href: "/dashboard/kategori" },
  ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  async function handleLogout(e) {
    e.preventDefault()
    const confirmation = confirm("Anda yakin ?")
    
    if (confirmation) {
      await logout()
      router("/login")
    } 
  }

  const sidebarStyles = {
    container: {
      transition: 'transform 0.3s ease',
      position: isMobile ? 'fixed' : 'sticky',
      width: '250px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#201f1f',
      height: '100vh',
      padding: '1rem',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      top: 0,
      left: 0,
      zIndex: 40,
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
      width: '100%', 
      gap: '10px'
    },
    welcomeMessage: {
      color: 'white',
      fontSize: '14px',
      marginTop: '10px',
      marginBottom: '20px'
    },
    navItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 10px',
      marginBottom: '8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
      textDecoration: 'none',
      color: isActive ? '#2563eb' : 'white',
      fontWeight: isActive ? 'bold' : 'normal',
    }),
    homeLink: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 10px',
      marginBottom: '8px',
      borderRadius: '4px',
      textDecoration: 'none',
      color: isHomeLinkHovered ? '#2563eb' : 'white',
      transition: 'color 0.2s'
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 10px',
      textAlign: 'left',
      width: '100%',
      background: 'none',
      border: 'none',
      borderRadius: '4px',
      color: '#e53e3e',
      cursor: 'pointer',
    },
    mobileHeader: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#201f1f',
      display: 'flex',
      alignItems: 'center',
      zIndex: 45,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    burgerButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: '8px'
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '10px',
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      color: 'white'
    },
    avatarContainer: {
      borderRadius: '50%',
      overflow: 'hidden',
      width: '40px',
      height: '40px',
      flexShrink: 0
    },
    userName: {
      marginRight: '10px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px'
    }
  }

  return (
    <>
      {/* Mobile header with burger menu */}
      {isMobile && (
        <div style={sidebarStyles.mobileHeader}>
          <button 
            onClick={toggleSidebar}
            style={sidebarStyles.burgerButton}
          >
            <Menu size={24} />
          </button>
          <div style={{ 
            marginLeft: '16px',
            color: 'white'
          }}>
            <span className="text-xl font-bold" style={{ color: '#2563eb' }}>TKJ</span>
            <span className="text-xl font-bold" style={{ color: '#f44336'}}>Aja</span>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`dashboard-sidebar ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
        style={{
          ...sidebarStyles.container,
          marginTop: isMobile ? '56px' : 0, // Add top margin to account for mobile header
          height: isMobile ? 'calc(100vh - 56px)' : '100vh' // Adjust height for mobile
        }}
      >
        <div>
          {!isMobile && (
            <div className="sidebar-logo" style={sidebarStyles.headerContainer}>
              <img src="/Logo-SMK8.png" className="size-13" alt="" />
              <div style={{ color: 'white' }} className="flex justify-center">
                <span className="text-2xl font-extrabold" style={{ color: '#2563eb' }}>TKJ</span>
                <span className="text-2xl font-extrabold" style={{ color: '#f44336'}}>Aja</span>
              </div>
              {isMobile && isOpen && (
                <button onClick={toggleSidebar} className="text-gray-500">
                  <DoorOpen size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Welcome message untuk semua ukuran layar */}
          
          {/* User Profile - hanya tampil saat mobile */}
          {isMobile && (
            <div className="user-profile" style={sidebarStyles.userProfile}>
              <span style={sidebarStyles.userName}>{user.name}</span>
              <div className="avatar-container" style={sidebarStyles.avatarContainer}>
                <img
                  src={user.profil ? import.meta.env.VITE_PROFILE_API_IMAGE + user.profil : "/default.jpg"}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="avatar-image"
                />
              </div>
            </div>
          )}
          
          <nav className="sidebar-nav" style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: isMobile ? '10px' : '20px'
          }}>
            {menuItems
              .filter((item) => !item.isadmin || user.role.role.toLowerCase() === "admin")
              .map((item) => (
                <NavLink
                  key={item.id}
                  className={`sidebar-nav-item`}
                  to={item.href}
                  end
                  style={sidebarStyles.navItem(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))
            }
          </nav>
        </div>
        
        <div className="sidebar-footer" style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto'
        }}>
          <a 
            href="/" 
            className="sidebar-nav-item" 
            style={sidebarStyles.homeLink}
            onMouseEnter={() => setIsHomeLinkHovered(true)}
            onMouseLeave={() => setIsHomeLinkHovered(false)}
          >
            <span className="mr-3"><ArrowLeft size={20}/></span>
            Kembali ke Beranda
          </a>
          
          <button 
            type="button" 
            onClick={handleLogout} 
            className="sidebar-nav-item w-full cursor-pointer logout"
          >
            <span className="mr-3"><DoorOpen size={20}/></span>
            Keluar
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 30 }}
        />
      )}
    </>
  )
}