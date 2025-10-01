import Landing from './pages/Landing'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from "./pages/dashboard/Dashboard";
import AuthLayout from './components/layouts/AuthLayout';
import RegisterPage from './pages/Register';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Landing />} />
          <Route element={<AuthLayout/>}>
            <Route path='/login' element={<div>Login Page</div>} />
            <Route path='/register' element={<RegisterPage/>} />
          </Route>
          <Route path='/dashboard' element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App