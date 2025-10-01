import { useState, useEffect } from "react"

import Loading from "../components/ui/Loading"

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordconfirmation: ""
  })
  const [loadingPage, setLoadingPage] = useState(false);

  if(loadingPage) {
    return <Loading text="Memuat..."/>
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(formData.password != formData.passwordconfirmation) {
      setError("Kata sandi tidak sama");
      return;
    }
    
    const register = await Register(formData);

    if(!register.status || !register.success) {
      setError(register.pesan || register.message);
    }

    if(register.status || register.success) {
      setSuccess(register.pesan || register.message)
      router.push('/login');
    }
  }

  return (
      <div className="auth-forms-container">
        <h2>Buat Akun Baru</h2>
        <p className="mb-2 text-red-500 text-center">{error}</p>
        <p className="mb-2 text-green-500 text-center">{success}</p>
        <form onSubmit={handleSubmit} className="auth-form active">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input bg-gray-800"
              placeholder="Masukkan nama lengkap"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input bg-gray-800"
              placeholder="Masukkan email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input bg-gray-800"
              placeholder="Masukkan kata sandi"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordconfirmation" className="form-label">
              Kata Sandi Konfirmasi
            </label>
            <input
              type="password"
              id="passwordconfirmation"
              name="passwordconfirmation"
              className="form-input bg-gray-800"
              placeholder="Masukkan kata sandi konfirmasi"
              value={formData.passwordconfirmation}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="form-submit">
            Daftar
          </button>
          <div className="form-footer">
            Sudah punya akun? <a href="/login">Masuk di sini</a>
          </div>
        </form>
      </div>
  )
}

