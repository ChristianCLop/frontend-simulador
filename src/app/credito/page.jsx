'use client'

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default function Admin() {
    const [bancos, setBancos] = useState([]);
    const [editarBanco, setEditarBanco] = useState(null);

    const [creditos, setCreditos] = useState([]);
    const [editarCredito, setEditarCredito] = useState(null);

    const [cobros, setCobros] = useState([]);
    const [editarCobro, setEditarCobro] = useState(null);

    const [monto, setMonto] = useState("");
    const [plazo, setPlazo] = useState("");
    const [metodoSeleccionado, setMetodoSeleccionado] = useState("opcion1");

    const [tablaAmortizacion, setTablaAmortizacion] = useState([]);

    const tableRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:4500/banco')
            .then(response => setBancos(response.data))
            .catch(error => console.error(error));
    }, []);

    const [bancoSeleccionado, setBancoSeleccionado] = useState(null);

    useEffect(() => {
        if (bancoSeleccionado) {
            axios.get(`http://localhost:4500/tipo-credito?bancoId=${bancoSeleccionado}`)
                .then(response => setCreditos(response.data))
                .catch(error => console.error(error));
        }
    }, [bancoSeleccionado]);

    const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);

    useEffect(() => {
        if (creditoSeleccionado) {
            axios.get(`http://localhost:4500/cobro?creditoId=${creditoSeleccionado}`)
                .then(response => setCobros(response.data))
                .catch(error => console.error(error));
        }
    }, [creditoSeleccionado]);

    /* ------------------------------------------------------------------------ */
    const handleSeleccionarBanco = (id) => {
        setBancoSeleccionado(id);
    }

    const handleInputChange = (e, id, campo) => {
        const newValue = e.target.value;
        setBancos(prevState =>
            prevState.map(banco =>
                banco.id === id ? { ...banco, [campo]: newValue } : banco
            )
        );
    }

    /* ------------------------------------------------------------------------ */

    const handleSeleccionarCredito = (id) => {
        setCreditoSeleccionado(id);
    }

    const handleInputChangeCredito = (e, id, campo) => {
        const newValue = e.target.value;
        setCreditos(prevState =>
            prevState.map(credito =>
                credito.id === id ? { ...credito, [campo]: newValue } : credito
            )
        );
    }

    /* ------------------------------------------------------------------------ */

    const handleInputChangeCobro = (e, id, campo) => {
        const newValue = e.target.value;
        setCobros(prevState =>
            prevState.map(cobro =>
                cobro.id === id ? { ...cobro, [campo]: newValue } : cobro
            )
        );
    }

    /* ------------------------------------------------------------------------ */

    const handleMontoChange = (event) => {
        const inputValue = event.target.value.replace(/[^0-9]/g, '');
        setMonto(inputValue);
    };

    const handlePlazoChange = (event) => {
        const inputValue = event.target.value.replace(/[^0-9]/g, '');
        setPlazo(inputValue);
    };

    const handleCalcular = () => {
        if (metodoSeleccionado === "opcion2") {
            // Calcular tabla de amortización con Método Alemán
            const capital = monto / plazo;
            const ianual = creditos.find(credito => credito.id === creditoSeleccionado)?.int_cre || 0;
            const i = ianual / 12;
            let saldo = monto;
            let totalCobroIndirecto = 0;
            const amortizacion = [];
            for (let mes = 1; mes <= plazo; mes++) {
                const interes = (saldo * i).toFixed(2);
                const cuota = (Number(capital) + Number(interes)).toFixed(2);
                saldo = (saldo - capital).toFixed(2);
                const cobroIndirecto = cobros.reduce((total, cobro) => total + Number(cobro.int_cob), 0);
                totalCobroIndirecto += cobroIndirecto;
                const cuotaConCobro = (Number(cuota) + cobroIndirecto).toFixed(2);
                amortizacion.push({
                    mes,
                    cuota: cuotaConCobro,
                    interes,
                    capital: capital.toFixed(2),
                    saldo,
                    cobroIndirecto,
                    saldoConCobro: (Number(saldo) + cobroIndirecto).toFixed(2)
                });
            }
            setTablaAmortizacion(amortizacion);

        } else if (metodoSeleccionado === 'opcion3') {
            console.log('Calcular tabla de amortización con Método Francés');
            const ianual = creditos.find(credito => credito.id === creditoSeleccionado)?.int_cre;
            const i = ianual / 12;
            const cuota = (monto * (i / (1 - Math.pow(1 + i, -plazo))));
            let saldo = monto;
            const amortizacion = [];
            const cobroIndirectoTotal = cobros.reduce((total, cobro) => total + cobro.int_cob, 0);
            for (let mes = 1; mes <= plazo; mes++) {
                const interes = ((saldo * ianual) / 12);
                const capital = (cuota - interes);
                saldo -= capital;
                const saldoConCobro = (saldo + cobroIndirectoTotal);
                amortizacion.push({
                    mes,
                    cuota: cuota.toFixed(2),
                    interes: interes.toFixed(2),
                    capital: capital.toFixed(2),
                    saldo: saldo.toFixed(2),
                    cobroIndirecto: cobroIndirectoTotal.toFixed(2),
                    saldoConCobro: saldoConCobro.toFixed(2),
                });
            }
            setTablaAmortizacion(amortizacion);
        }
    }

    const handleDownloadPDF = () => {
        if (!tableRef.current) return;
    
        const input = tableRef.current;
    
        const pdf = new jsPDF('p', 'mm', 'a4');

        let posY = 15;

        const logoUrl = bancos.find(banco => banco.id === bancoSeleccionado)?.log_ban;

        if (logoUrl) {
            pdf.addImage(logoUrl, 'PNG', 15, posY, 40, 40); 
            posY += 45;
        }

        const rows = input.querySelectorAll('tr');
    
        const cellHeight = 10;
        const marginBottom = 20;

        const addPageAndResetPosition = () => {
            pdf.addPage();
            posY = 15;
        };

        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td, th');

            if (posY + cellHeight + marginBottom > pdf.internal.pageSize.height) {
                addPageAndResetPosition();
            }
    
            const rowData = [];
            cells.forEach((cell) => {
                rowData.push(cell.innerText);
            });

            pdf.autoTable({
                startY: posY,
                body: [rowData],
            });
    
            posY += cellHeight;

            if (rowIndex === rows.length - 1 && posY + marginBottom > pdf.internal.pageSize.height) {
                addPageAndResetPosition();
            }
        });

        pdf.save('tabla_amortizacion.pdf');
    };


    /* ------------------------------------------------------------------------ */

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
            <div className="flex justify-center items-center pt-10">
                <div className="flex w-3/4">
                    <div className='container p-4 w-1/2 bg-[#555252] border-4 rounded-tl-2xl rounded-bl-2xl text-center flex-col justify-center items-center h-[550px]'>
                        <div className="p-4 flex items-center justify-center">
                            <a href="/inversion">
                                <button className="border-2 border-black bg-[#94ba65] rounded-xl w-32 font-bold flex items-center justify-center space-x-2">
                                    Inversión
                                </button>
                            </a>
                        </div>
                        <h1 className="text-white font-serif font-extrabold text-2xl">Simula tu inversión!!</h1>
                        <div className='flex flex-col'>
                            {/* BANCO */}
                            <div className='basis-1/2'>
                                <div className='justify-center'>
                                    <h2 className='uppercase text-xl font-semibold font-mono m-1 text-white'>Seleccione un banco</h2>
                                </div>
                                <div className='items-center h-24 overflow-y-scroll'>
                                    <table className='border text-center justify-center w-full'>
                                        <thead className='justify-center border'>
                                            <tr>
                                                <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Nombre</th>
                                                <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Selección</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bancos.map(banco => (
                                                <tr key={banco.id}>
                                                    <td className='px-4 py-2 text-center text-white'>{editarBanco === banco.id ? <input className='border w-20 px-4 py-2 text-center ' type="text" maxLength={25} minLength={4} value={banco.nom_ban} onChange={(e) => handleInputChange(e, banco.id, 'nom_ban')} /> : banco.nom_ban}</td>
                                                    <td><button className='align-middle items-center justify-center ml-4' onClick={() => handleSeleccionarBanco(banco.id)}>{bancoSeleccionado === banco.id ? (
                                                        <img className='h-6 w-6 ' src="/svg/selected-green.svg" alt="" />) : (
                                                        <img className='h-6 w-6' src="/svg/selected-black.svg" alt="" />
                                                    )}</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className='flex flex-row mt-7'>
                                {/* CREDITO */}
                                <div className='basis-1/2 p-2'>
                                    <div className='flex relative justify-center'>
                                        <h2 className='uppercase text-xl font-semibold font-mono m-2 text-white'>Creditos</h2>
                                    </div>
                                    <div className='items-center overflow-y-scroll'>
                                        <table className='border text-center justify-center w-full h-full'>
                                            <thead className='justify-center border'>
                                                <tr>
                                                    <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Nombre</th>
                                                    <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Interes</th>
                                                    <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Selecciona</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {creditos.map(credito => (
                                                    <tr key={credito.id}>
                                                        <td className='px-4 py-2 text-center text-white'>
                                                            {editarCredito === credito.id ? (
                                                                <input className='border w-20 px-4 py-2 text-center' type="text" maxLength={25} minLength={4} value={credito.nom_cre} onChange={(e) => handleInputChangeCredito(e, credito.id, 'nom_cre')} />
                                                            ) : (
                                                                credito.nom_cre
                                                            )}
                                                        </td>
                                                        <td className='px-4 py-2 text-center text-white'>
                                                            {editarCredito === credito.id ? (
                                                                <input className='border w-20 px-4 py-2 text-center' type="number" maxLength={5} minLength={1} min={0.1} value={credito.int_cre} onChange={(e) => handleInputChangeCredito(e, credito.id, 'int_cre')} />
                                                            ) : (
                                                                credito.int_cre
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button className='align-middle items-center justify-center ml-4' onClick={() => handleSeleccionarCredito(credito.id)}> {creditoSeleccionado === credito.id ? (<img className='h-6 w-6' src="/svg/selected-green.svg" alt="" />) : (<img className='h-6 w-6' src="/svg/selected-black.svg" alt="" />)}</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* Cobro */}
                                <div className='basis-1/2 p-2'>
                                    <div className='flex relative justify-center'>
                                        <h2 className='uppercase text-xl font-semibold font-mono m-2 text-white'>Cobros</h2>
                                    </div>
                                    <div className='items-center overflow-y-scroll'>
                                        <table className='border text-center justify-center w-full'>
                                            <thead className='justify-center border'>
                                                <tr>
                                                    <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Nombre</th>
                                                    <th className='border font-mono text-white sticky top-0 bg-gray-800 z-10'>Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cobros.map(cobro => (
                                                    <tr key={cobro.id}>
                                                        <td className='px-4 py-2 text-center text-white'>
                                                            {editarCobro === cobro.id ? (
                                                                <input className='border w-20 px-4 py-2 text-center' type="text" maxLength={25} minLength={4} value={cobro.nom_cob} onChange={(e) => handleInputChangeCobro(e, cobro.id, 'nom_cob')} />
                                                            ) : (
                                                                cobro.nom_cob
                                                            )}
                                                        </td>

                                                        <td className='px-4 py-2 text-center text-white'>
                                                            {editarCobro === cobro.id ? (
                                                                <input className='border w-20 px-4 py-2 text-center' type="number" maxLength={5} minLength={1} min={0.1} value={cobro.int_cob} onChange={(e) => handleInputChangeCobro(e, cobro.id, 'int_cob')} />
                                                            ) : (
                                                                cobro.int_cob
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-2/3 border-4 justify-center container p-4 bg-[#555252] text-center flex-col items-center rounded-tr-2xl rounded-br-2xl h-[550px]">
                        {bancoSeleccionado && creditoSeleccionado && (
                            <div className="flex flex-col">
                                <label htmlFor="monto" className="text-sm font-semibold flex items-center text-white">
                                    Monto: <img className="h-6 w-6 ml-2" src="/svg/money.svg" alt="" />
                                </label>
                                <div className="flex flex-col">
                                    <input
                                        type="text"
                                        value={monto}
                                        onChange={handleMontoChange}
                                        className="p-2 mt-2 bg-[#94ba65] text-white rounded-md w-full text-center placeholder-white"
                                        placeholder="Monto"
                                        maxLength={10}
                                    />
                                    <label htmlFor="plazo" className="text-sm font-semibold flex items-center text-white mt-2">
                                        Plazo: <img className="h-5 w-5 ml-2" src="/svg/time.svg" alt="" />
                                    </label>
                                    <input
                                        type="text"
                                        value={plazo}
                                        onChange={handlePlazoChange}
                                        className="p-2 mt-2 bg-[#94ba65] text-white rounded-md w-full text-center placeholder-white"
                                        placeholder="Plazo"
                                        maxLength={3}
                                    />
                                    <select className=' mt-2 p-2 mb-2 bg-[#94ba65] text-white font-bold rounded-md border' value={metodoSeleccionado} onChange={(e) => setMetodoSeleccionado(e.target.value)}>
                                        <option value="opcion1">Seleccione un método</option>
                                        <option value="opcion2">Método Alemán</option>
                                        <option value="opcion3">Método Francés</option>
                                    </select>
                                    <button type="button" className="bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] font-bold py-2 px-4 rounded-md mb-5" onClick={handleCalcular}>
                                        Calcular
                                    </button>
                                </div>
                                <div className='bg-white p-4' ref={tableRef}>
                                    <div className='max-h-[170px] overflow-y-scroll'>
                                        <table className='w-full border-collapse'>
                                            <tbody>
                                                {bancos.map(banco => (
                                                    banco.id === bancoSeleccionado && (
                                                        <tr key={banco.id}>
                                                            <td className='px-4 py-2'>
                                                                <img className='w-20 mx-auto' src={banco.log_ban} alt="" />
                                                            </td>
                                                            <td className='px-4 py-2 text-center text-6xl font-serif font-bold uppercase'>{banco.nom_ban}</td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Tabla de amortización */}
                                        {tablaAmortizacion.length > 0 && (
                                            <table className='w-full border-collapse'>
                                                <thead className=''>
                                                    <tr>
                                                        <th className='border font-mono'>Mes</th>
                                                        <th className='border font-mono'>Cuota</th>
                                                        <th className='border font-mono'>Interés</th>
                                                        <th className='border font-mono'>Capital</th>
                                                        <th className='border font-mono'>Saldo</th>
                                                        <th className='border font-mono'>Cobro</th>
                                                        <th className='border font-mono'>Saldo + Cobro</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tablaAmortizacion.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className='border px-4 py-2'>{item.mes}</td>
                                                            <td className='border px-4 py-2'>{item.cuota}</td>
                                                            <td className='border px-4 py-2'>{item.interes}</td>
                                                            <td className='border px-4 py-2'>{item.capital}</td>
                                                            <td className='border px-4 py-2'>{item.saldo}</td>
                                                            <td className='border px-4 py-2'>{item.cobroIndirecto}</td>
                                                            <td className='border px-4 py-2'>{item.saldoConCobro}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>                                    
                                </div>
                                <button className='bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] font-bold py-2 px-4 rounded-md mb-5' onClick={handleDownloadPDF}>Descargar PDF</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
