'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";

const Login = () => {
    const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
    const [cor_adm, setCorreo] = useState("");
    const [con_adm, setContrasenia] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:4500/banco')
            .then(response => setBancos(response.data))
            .catch(error => console.log(error));
    }, []);

    const cambiarVisibilidadContrasenia = () => {
        setMostrarContrasenia(!mostrarContrasenia);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:4500/admin/login", {
                cor_adm,
                con_adm,
            });

            localStorage.setItem('token', response.data.token);

            console.log("Respuesta de login:", response.data);
            setLoading(false);
            window.location.replace("/admin");
        } catch (error) {
            setLoading(false);
            setError("Error al iniciar sesión. Verifica tus credenciales.");
            console.error("Error de login:", error);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('/img/background.png')]">
            <div className="bg-[#8db986] p-4 flex items-center justify-between">
                <button className="border-2 border-black p-4 m-4 bg-[#8c2318] rounded-xl w-40">
                    <a className='font-bold' href="/">🡠 ATRAS</a>
                </button>
                <h1 className="text-white font-extrabold text-5xl text-center uppercase font-serif">Inicio de sesión</h1>
                <div className="w-40"></div>
            </div>
            <div className="flex justify-center items-center h-screen pb-32">
                <div className="flex w-3/4 ">                    
                    <div className="w-3/4 border-4 flex justify-center items-center rounded-tl-2xl rounded-bl-2xl">
                        <img
                            className="h-auto w-auto max-h-full max-w-full object-contain rounded-tl-2xl rounded-bl-2xl"
                            src="/img/logoPrin.jpg"
                            alt="Logo"
                        />
                    </div>
                    <div className="container p-4 w-1/4 bg-[#373737] border-4 rounded-tr-2xl rounded-br-2xl text-center flex flex-col justify-center items-center">
                        <form className="mt-4" onSubmit={handleLogin}>
                            <div className="mb-2 relative">
                                <input
                                    className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    type="text"
                                    placeholder="Correo electrónico"
                                    value={cor_adm}
                                    onChange={(e) => setCorreo(e.target.value)}
                                />
                                <img
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 fill-current text-black pointer-events-none"
                                    src="/svg/email.svg"
                                    alt=""
                                />
                            </div>
                            <div className="mb-2 relative">
                                <input
                                    className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    type={mostrarContrasenia ? "text" : "password"}
                                    placeholder="Contraseña"
                                    value={con_adm}
                                    onChange={(e) => setContrasenia(e.target.value)}
                                />
                                <img
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 h-6 w-6 fill-current text-black cursor-pointer"
                                    src={mostrarContrasenia ? "/svg/eye.svg" : "/svg/eye-close.svg"}
                                    alt=""
                                    onClick={cambiarVisibilidadContrasenia}
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <div className="flex justify-center mt-4">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-[#94ba65] text-white rounded-md hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65]"
                                    disabled={loading}
                                >
                                    {loading ? "Cargando..." : "Continuar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
