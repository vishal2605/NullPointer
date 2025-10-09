"use client";
import { signOut, useSession } from "next-auth/react"


export default function Dashboard(){
    const session = useSession();

    const handleLogout = () => {
        signOut();
    }

    return (
        <div>
            {JSON.stringify(session)} 
            dashboard
            <button onClick={handleLogout}>
                Logout
            </button>
        </div>

    )
}