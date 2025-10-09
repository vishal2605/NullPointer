"use client";
import Image from 'next/image';
import logo from '../../asset/logo.png';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navigation(){
    const session = useSession();
    const router = useRouter();
    function goToLoginPage(){
        router.push("/signin");
    }
    return (
        <div className="flex justify-between p-2">
            <div className='flex'>
                <Image src={logo} alt="Logo" height={50} width={50} priority />
                <div className='flex items-center pl-3 hover:text-red-700'>
                    Problems
                </div>
                <div className='flex items-center pl-3 hover:text-red-700' >
                    Discuss
                </div>
            </div>
            <div className='flex items-center'>
                {session.status==='authenticated' ?(<div>
                    
                </div>) :(
                    <button className='pr-3 hover:text-red-700' onClick={goToLoginPage}>
                        Login/Signup
                    </button>)}
            </div>
        </div>
    )
}