import { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" />;
    }

    const decodedToken: any = jwtDecode(token);
    const userRole = decodedToken?.role;

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    } else {
        return <Navigate to="/" />;
    }
};

export default ProtectedRoute;
