import Landing from './pages/Landing'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from "./pages/dashboard/Dashboard";
import AuthLayout from './components/layouts/AuthLayout';
import RegisterPage from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import PrivateRoute from './middleware/PrivateRoute';
import Beritaku from './pages/dashboard/Beritaku';
import UserManagement from './pages/dashboard/UserManagement';
import RoleManagement from './pages/dashboard/RoleManagement';
import ListBerita from './pages/dashboard/ListBerita';
import ListKategori from './pages/dashboard/ListKategori';
import Berita from './pages/Berita';
import BeritaDetail from './pages/BeritaDetail';
import Kategori from './pages/Kategori';
import BeritaCreate from './pages/dashboard/BeritaCreate';
import UserCreate from './pages/dashboard/UserCreate';
import RoleCreate from './pages/dashboard/RoleCreate';
import KategoriCreate from './pages/dashboard/KategoriCreate';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Landing />} />
            <Route path='/berita' element={<Berita />} />
            <Route path='/berita/:id' element={<BeritaDetail />} />
            <Route path='/kategori' element={<Kategori />} />
            <Route path='/kategori/:id' element={<Berita />} />
            <Route element={<AuthLayout/>}>
              <Route path='/login' element={<LoginPage/>} />
              {/* <Route path='/register' element={<RegisterPage/>} /> */}
            </Route>
            <Route element={<PrivateRoute/>}>
              <Route path='/dashboard' element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path='beritaku' element={<Beritaku />} />
                <Route path='beritaku/create' element={<BeritaCreate />} />
                <Route path='beritaku/edit/:id' element={<BeritaCreate edit/>} />
                <Route path='user' element={<UserManagement />} />
                <Route path='user/create' element={<UserCreate />} />
                <Route path='user/edit/:id' element={<UserCreate edit/>} />
                <Route path='role' element={<RoleManagement />} />
                <Route path='role/create' element={<RoleCreate />} />
                <Route path='role/edit/:id' element={<RoleCreate edit/>} />
                <Route path='berita' element={<ListBerita />} />
                <Route path='kategori' element={<ListKategori />} />
                <Route path='kategori/create' element={<KategoriCreate />} />
                <Route path='kategori/edit/:id' element={<KategoriCreate edit />} />
              </Route>
            </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App