"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const handleLogin = () => {
        console.log("Login",email,password);
    }
    return (
      <div>
        <div>
          <h2>Sign In to Null Pointer</h2>
          <form>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" onClick={handleLogin}>Sign In</button>
          </form>
          <p>Don't have an account? <Link href="/register">Register</Link></p>
        </div>
      </div>
    );
  }