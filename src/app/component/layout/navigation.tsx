"use client";
import Image from 'next/image';
import logo from '../../asset/logo.png';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navigation(){
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
                {session.status==='authenticated' ?(<div 
                className='w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-200'
                onClick={goToProfilePage}
                >
                {session.data.user.username.charAt(0).toUpperCase()}
                </div>) :(
                    <button className='pr-3 hover:text-red-700' onClick={goToLoginPage}>
                        Login/Signup
                    </button>)}
            </div>

        </div>
    )
}