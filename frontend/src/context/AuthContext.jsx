    import { createContext, useContext, useEffect, useState } from "react";
    import { api, apiIndex } from "../lib/api";

    const AuthContext = createContext(undefined);

    export const AuthProvider = ({children}) => {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(true);

        const fetchMe = async () => {
            try {
                const res = await api.get("/me");
                setUser(res.data.user)
            } catch {
                setUser(null)
            }
        }
        useEffect(() => {
            setLoading(true);
            fetchMe().finally(() => setLoading(false));
        }, [])

        const login = async (email, password) => {
            setLoading(true);
            try {
                await api.post("/login", { email, password });
                const res = await api.get("/me");
                setUser(res.data.user)
            } catch(err) {
                throw new Error("Gagal Untuk Login");
            } finally {
                setLoading(false);
            }
        }
        
        const logout = async () => {
            setLoading(true);
            try {
                await api.post("/logout");
                setUser(null);
            } catch(err) {
                throw new Error("Gagal Untuk Logout");
            } finally {
                setLoading(false);
            }
        }

        const refreshUser = async () => {
            setLoading(true);
            try {
            await fetchMe();
            } finally {
            setLoading(false);
            }
        };

        return (
            <AuthContext.Provider value={{user, loading, login, logout, refreshUser}}>
                {children}
            </AuthContext.Provider>
        )
    }

    export const useAuth = () => {
        const ctx = useContext(AuthContext);
        if(!ctx) throw new Error("useAuth must be used inside AuthProvider");
        return ctx;
    }