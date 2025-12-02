import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            navigate("/");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return <div>Finishing login...</div>;
}
