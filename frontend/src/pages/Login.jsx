import { useState, useEffect, useRef } from "react"

import Loading, { LoadingCircle } from "../components/ui/Loading"         
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../lib/zod";
import { apiIndex, api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [errorInput, setErrorInput] = useState({});
  const [success, setSuccess] = useState("");
  const {user, login} = useAuth();
  const [loadingAuth, setLoadingAuth] = useState(false);
  const emailRef = useRef(null);
  const pwRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingAuth(true);

    const parsed = loginSchema.safeParse(formData);
    setError("");
    setErrorInput({});
    if(!parsed.success) {
      const fieldErrors = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path[0];
        fieldErrors[field] = err.message;
      })

      setErrorInput(fieldErrors);

      if(fieldErrors.email && emailRef.current) {
        emailRef.current.focus()
      } else if(fieldErrors.password && pwRef.current) {
        pwRef.current.focus();
      }

      setLoadingAuth(false);
      return;
    }

    // jika valid, lanjutkan proses login
    try {
      await apiIndex.get("/sanctum/csrf-cookie");
      await login(formData.email, formData.password);
      navigate("/dashboard", {replace: true});
    } catch(err) {
      setError("Gagal untuk login, periksa kembali email dan password anda");
    } finally {
      setLoadingAuth(false);
    }
  }

  useEffect(() => {
    if(user) {
      navigate("/dashboard", {replace: true});
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await api.post("/logout");
  }

  return (
      <div className="auth-forms-container">
        <h2>Masuk ke Akun Anda</h2>
        <p className="mb-2 text-red-500 text-center">{error}</p>
        <p className="mb-2 text-green-500 text-center">{success}</p>
        <form onSubmit={handleSubmit} className="auth-form active">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errorInput.password ? "error placeholder:text-red-500" : ""}`}
              placeholder="Masukkan email"
              value={formData.email}
              onChange={handleChange}
              ref={emailRef}
            />
          {errorInput.email && (
            <p className="text-red-500">{errorInput.email}</p>
          )}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Kata Sandi
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errorInput.password ? "error placeholder:text-red-500" : ""}`}
              placeholder="Masukkan kata sandi"
              value={formData.password}
              onChange={handleChange}
              ref={pwRef}
            />
            {errorInput.password && (
              <p className="text-red-500">{errorInput.password}</p>
            )}
          </div>
          <button disabled={loadingAuth} type="submit" className={`form-submit flex justify-center gap-2 ${loadingAuth ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
            {loadingAuth && <LoadingCircle/>} Masuk
          </button>
          {/* <div className="form-footer">
            Belum punya akun? <a href="/register">Daftar di sini</a>
            </div> */}
        </form>
      </div>
  )
}

