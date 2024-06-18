'use client'

import { useEffect, useState, React } from 'react';
import axios from 'axios';

export default function HomePage() {
  
  return (
    <div className="h-screen overflow-hidden bg-[url('/img/background.png')]">
      <div className="flex items-center justify-between bg-[#8db986] p-4 text-center">
        <div></div>
        <div className='text-white font-serif font-extrabold text-5xl'>CrediPlan</div>
        <div className="w-20 bg-[#3b657a] border-4 flex justify-center items-center rounded-full">
          <img className='h-auto w-auto max-h-full max-w-full object-contain rounded-full' src="/img/logoApp.png" alt="Logo" />
        </div>
      </div>
      <div className="flex justify-center items-center h-screen pb-20">
        <div className="flex w-3/4">
          <div className="w-1/4 bg-[#373737] text-center border-4 flex flex-col justify-center items-center rounded-tl-2xl rounded-bl-2xl">
            <div>
              <a href="/login">
                <button className="border-2 border-black p-4 m-4 bg-[#94ba65] rounded-xl w-40 font-bold flex items-center justify-center space-x-2">Administrador <img className='h-6 w-6 ml-1' src="/svg/admin.svg" alt="" /></button>
              </a>
              <a href="/credito">
                <button className="border-2 border-black p-4 m-4 bg-[#94ba65] rounded-xl w-40 font-bold flex items-center justify-center space-x-2">Usuario <img className='h-6 w-6 ml-1' src="/svg/user.svg" alt="" /></button>
              </a>
            </div>
          </div>
          <div className="w-3/4 border-4 flex justify-center items-center rounded-tr-2xl rounded-br-2xl">
            <img className='h-auto w-auto max-h-full max-w-full object-contain rounded-tr-2xl rounded-br-2xl' src="/img/logoPrin.jpg" alt="Logo" />
          </div>
        </div>
      </div>
    </div>
  )
}