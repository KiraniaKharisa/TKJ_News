import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui/Loading";

const PrivateRoute = ({requiredRole}) => {
    const {user, loading} = useAuth();
    if(loading) return <LoadingScreen/>
    if(!user) return <Navigate to={"/login"} replace/>

    if(requiredRole && user.role.role.toLowerCase() !== requiredRole.toLowerCase()) return <Navigate to={"/dashboard"} replace/>

    return <Outlet/>
}

export default PrivateRoute;