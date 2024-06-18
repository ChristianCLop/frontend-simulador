'use client'

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export default function Login() {
    const [bancos, setBancos] = useState([]);
    const [bancoSeleccionado, setBancoSeleccionado] = useState("");

    const [mostrarInputs, setMostrarInputs] = useState(false);

    const [inversion, setInversion] = useState("");
    const [monto, setMonto] = useState("");
    const [plazo, setPlazo] = useState("");
    const [total, setTotal] = useState(0);

    const [showError, setShowError] = useState(false);
    const [errorMessagePlazo, setErrorMessagePlazo] = useState("");

    const [bloquearBoton, setBloquearBoton] = useState(true);
    
    const tableRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:4500/banco')
            .then(response => setBancos(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleBancoSeleccionado = (event) => {
        const selectedBanco = event.target.value;
        setBancoSeleccionado(selectedBanco);
        setMostrarInputs(selectedBanco !== "");
    };

    const handleSelectChange = (event) => {
        const tipoInversion = event.target.value;
        setInversion(tipoInversion);
        setPlazo("");
        setErrorMessagePlazo("");
    };

    const handleMontoChange = (event) => {
        const inputValue = event.target.value.replace(/[^0-9]/g, '');
        setMonto(inputValue);
        setShowError(inputValue !== '' && parseInt(inputValue) < 1000);
        setBloquearBoton(!inputValue || showError || !plazo || errorMessagePlazo);
    };

    const handlePlazoChange = (event) => {
        const inputValue = event.target.value.replace(/[^0-9]/g, '');
        setPlazo(inputValue);

        let errorMessage = "";
        switch (inversion) {
            case "opcion1": // Años
                errorMessage = parseInt(inputValue) < 27 ? "" : "Máximo 27 años";
                break;
            case "opcion2": // Meses
                errorMessage = parseInt(inputValue) < 323 ? "" : "Máximo 323 meses";
                break;
            case "opcion3": // Días
                errorMessage = parseInt(inputValue) < 9999 ? "" : "Máximo 9999 días";
                break;
            default:
                errorMessage = "";
                break;
        }

        setErrorMessagePlazo(errorMessage);
        setBloquearBoton(!monto || showError || !inputValue || errorMessagePlazo);
    };

    const handleCalcular = () => {
        const bancoSeleccionadoObj = bancos.find(banco => banco.id === parseInt(bancoSeleccionado));
        const tas_ban = bancoSeleccionadoObj ? bancoSeleccionadoObj.tas_ban : 0

        const factorConversor = inversion === "opcion2" ? 12 : inversion === "opcion3" ? 365 : 1;
        const interes = parseFloat(monto) * parseFloat(plazo) * ((parseFloat(tas_ban) / 100) / factorConversor);
        const totalCalculado = interes + parseFloat(monto);

        setTotal(totalCalculado.toFixed(2));
    };

    const handleDownloadPDF = async () => {
        if (!tableRef.current) return;
    
        const input = tableRef.current;
    
        const pdf = new jsPDF('p', 'mm', 'a4');
    
        let posY = 15;
    
        const logoUrl = bancos.find(banco => banco.id === parseInt(bancoSeleccionado))?.log_ban;

        if (logoUrl) {
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const imageDataUrl = URL.createObjectURL(blob);

                pdf.addImage(imageDataUrl, 'PNG', 15, posY, 40, 40);
                posY += 45;
            } catch (error) {
                console.error('Error al cargar la imagen:', error);
            }
        }

        html2canvas(input).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 15, posY, pdf.internal.pageSize.getWidth() - 30, canvas.height * (pdf.internal.pageSize.getWidth() - 30) / canvas.width);
            pdf.save('inversión.pdf');
        }).catch(error => {
            console.error('Error al convertir el contenido a imagen:', error);
        });
    };

    return (
        <div className="h-screen overflow-hidden bg-[url('/img/background.png')]">
            <div className="flex flex-col">
                <div className="bg-[#8db986] p-4 flex items-center justify-between">
                    <a href="/">
                        <button className="border-2 border-black bg-[#8c2318] rounded-xl w-32 h-10">🡠 ATRAS</button>
                    </a>
                    <div className="text-white font-serif font-extrabold text-5xl">CrediPlan</div>
                    <div key={bancos.id} className="w-20 bg-[#3b657a] border-4 flex justify-center items-center rounded-full">
                        <img className='h-auto w-auto max-h-full max-w-full object-contain rounded-full' src="/img/logoApp.png" alt="Logo" />
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center h-screen pb-32">
                <div className="flex w-3/4">
                    <div className="container p-4 w-1/2 bg-[#555252] border-4 rounded-tl-2xl rounded-bl-2xl text-center flex-col justify-center items-center">
                        <div className="p-4 flex items-center justify-center">
                            <a href="/credito">
                                <button className="border-2 border-black bg-[#94ba65] rounded-xl w-32 font-bold flex items-center justify-center space-x-2">
                                    Credito
                                </button>
                            </a>
                        </div>
                        <h1 className="text-white font-serif font-extrabold text-2xl">Simula tu inversión!!</h1>
                        <form className="mt-4">
                            <select className="p-2 bg-[#94ba65] text-white font-bold rounded-md" onChange={handleBancoSeleccionado} value={bancoSeleccionado}>
                                <option value="">Selecciona un banco</option>
                                {bancos.map(banco => (
                                    <option key={banco.id} value={banco.id}>{banco.nom_ban}</option>
                                ))}
                            </select>
                            {mostrarInputs && bancoSeleccionado !== "" && (
                                <>
                                    <div className="mt-4">
                                        <label htmlFor="monto" className="text-sm font-semibold flex items-center text-white">
                                            Monto: <img className="h-6 w-6 ml-2" src="/svg/money.svg" alt="" />
                                        </label>
                                        <input
                                            type="text"
                                            id="monto"
                                            value={monto}
                                            onChange={handleMontoChange}
                                            className={`p-2 mt-2 bg-[#94ba65] text-white rounded-md w-full ${showError ? 'border-red-500' : ''}`}
                                            placeholder="Monto"
                                            maxLength={10}
                                        />
                                        {showError && <p className="text-red-500">El monto mínimo es de 1000</p>}
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="plazo" className="text-sm font-semibold flex items-center text-white">
                                            Plazo: <img className="h-5 w-5 ml-2" src="/svg/time.svg" alt="" />
                                        </label>
                                        <div className="flex flex-row items-center">
                                            <select className="p-2 mt-2 bg-[#94ba65] text-white font-bold rounded-md" onChange={handleSelectChange} value={inversion}>
                                                <option value="opcion1">Años</option>
                                                <option value="opcion2">Meses</option>
                                                <option value="opcion3">Días</option>
                                            </select>
                                            <input type="text" value={plazo} onChange={e => {
                                                let inputValue = e.target.value;
                                                inputValue = inputValue.replace(/[^0-9]/g, '');
                                                if (inputValue === "" || (parseInt(inputValue) <= 9999 && inputValue.length <= 4)) {
                                                    handlePlazoChange({ target: { value: inputValue } });
                                                }
                                            }} className={`p-2 mt-2 ml-2 bg-[#94ba65] text-white rounded-md w-full placeholder-white ${errorMessagePlazo ? 'border-red-500' : ''}`} />
                                        </div>
                                        {errorMessagePlazo && <p className="text-red-500">{errorMessagePlazo}</p>}
                                    </div>
                                    <div className="mt-4">
                                        <button type="button" className="bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] font-bold py-2 px-4 rounded-md" onClick={handleCalcular}>
                                            Calcular
                                        </button>                                        
                                    </div>
                                </>
                            )}
                        </form>
                        <button className='bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] font-bold py-2 px-4 rounded-md mt-5' onClick={handleDownloadPDF}>Descargar PDF</button>
                    </div>
                    <div className="w-3/4 border-4 flex justify-center items-center rounded-tr-2xl rounded-br-2xl" ref={tableRef}>
                        {mostrarInputs && (
                            <div className="text-center">
                                {bancoSeleccionado !== "" && (
                                    <div>
                                        <img src={bancos.find(banco => banco.id === parseInt(bancoSeleccionado))?.log_ban} alt="Logo del banco" className="w-32 h-32 mx-auto inline-block mr-2" />
                                        <p className="font-bold text-6xl font-serif inline-block">{bancos.find(banco => banco.id === parseInt(bancoSeleccionado))?.nom_ban || 'N/A'}</p>                                        
                                    </div>
                                )}
                                <p className="font-thin font-mono text-2xl">Monto ingresado: {monto}</p>
                                <p className="font-thin font-mono text-2xl">Tipo de inversión: {inversion === 'opcion1' ? 'Años' : inversion === 'opcion2' ? 'Meses' : 'Días'}</p>
                                <p className="font-thin font-mono text-2xl">Plazo ingresado: {plazo} {inversion === 'opcion1' ? 'años' : inversion === 'opcion2' ? 'meses' : 'días'}</p>                                
                                <p className="font-thin font-mono text-2xl">Interés del banco seleccionado: {bancoSeleccionado !== "" ? (bancos.find(banco => banco.id === parseInt(bancoSeleccionado))?.tas_ban || 'N/A') : 'N/A'}</p>
                                <p className="font-thin font-mono text-2xl">Total: {total}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}