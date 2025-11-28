"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from 'next/image';
import logo from '../../asset/logo.png';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useProblem } from "@/app/context/ProblemContext";


export default function Navigation(){

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { resetAllStorage } = useProblem();

    // close dropdown on outside click
    useEffect(() => {
    function handleClick(e: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
    }, []);


    const session = useSession();
    const router = useRouter();
    const pathname = usePathname();
    function goToLoginPage(){
        router.push("/signin");
    }
    function goToProblemPage(){
        router.push("/problems");
    }
    function goToDiscussPage(){
        router.push("/discuss");
    }
    function goToProfilePage(){
        router.push("/profile");
    }
    return (
        <div className="flex justify-between p-2">
            <div className='flex'>
                <Image src={logo} alt="Logo" height={50} width={50} priority />
                <div className='flex items-center pl-3 hover:text-red-700'onClick={goToProblemPage}>
                    Problems
                </div>
                <div className='flex items-center pl-3 hover:text-red-700' onClick={goToDiscussPage}>
                    Discuss
                </div>
            </div>
            <div className='flex items-center'>
                {session.status==='authenticated' ?(<div className="relative" ref={dropdownRef}>
                <div
                    className="w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {session.data.user.username.charAt(0).toUpperCase()}
                </div>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 z-50">
                    <div
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={goToProfilePage}
                    >
                        Profile
                    </div>

                    <div
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                        onClick={() => {
                            resetAllStorage()
                            signOut({ callbackUrl: "/signin" });
                          }}                    
                    >
                        Logout
                    </div>
                    </div>
                )}
                </div>
                ) :(
                    <button className='pr-3 hover:text-red-700' onClick={goToLoginPage}>
                        Login/Signup
                    </button>)}
            </div>

        </div>
    )
}