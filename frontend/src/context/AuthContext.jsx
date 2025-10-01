import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

type User = {
    id: string,
    email: string,
    created_at: string,
    name: string,
    profil: string,
    role: {
        id: string,
        role: string
    }
}

type AuthContextType = {
    user: User | null,
    loading: boolean,
    login: (email: string, password: string) => Promise<void>,
    logout: () => Promise<void>,
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
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

    const login = async (email: string, password: string) => {
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