'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Akun admin khusus web komik kamu
    if (username === 'adminyanama' && password === 'komikrahasia123') {
      document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Strict";
      router.push('/admin');
      router.refresh();
    } else {
      setErrorMsg('❌ Username atau Password salah!');
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-orange-500 text-center mb-2">Admin Login</h1>
        <p className="text-xs text-gray-500 text-center mb-6">Khusus untuk pemilik Yanama Comic</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-orange-500" 
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 font-semibold mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-orange-500" 
              required
            />
          </div>

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded text-sm transition mt-2">
            Masuk ke Panel
          </button>
        </form>

        {errorMsg && (
          <p className="mt-4 text-xs text-red-400 text-center font-medium bg-red-950/20 p-2 rounded border border-red-900/30">
            {errorMsg}
          </p>
        )}
      </div>
    </main>
  );
}