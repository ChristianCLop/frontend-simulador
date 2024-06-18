'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

export default function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [bancos, setBancos] = useState([]);
    const [nuevoBanco, setNuevoBanco] = useState({
        nom_ban: '',
        log_ban: '',
        tas_ban: ''
    });
    const [editarBanco, setEditarBanco] = useState(null);
    const [modalBancoIsOpen, setModalBancoOpen] = useState(null);

    const [creditos, setCreditos] = useState([]);
    const [nuevoCredito, setNuevoCredito] = useState({
        nom_cre: '',
        int_cre: '',
        bancoId: ''
    });
    const [editarCredito, setEditarCredito] = useState(null);
    const [modalCreditoIsOpen, setModalCreditoOpen] = useState(null);

    const [cobros, setCobros] = useState([]);
    const [nuevoCobro, setNuevoCobro] = useState({
        nom_cob: '',
        int_cob: '',
        creditoId: ''
    });
    const [editarCobro, setEditarCobro] = useState(null);
    const [modalCobroIsOpen, setModalCobroOpen] = useState(null);

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

    const handleEditarBanco = (id) => {
        setEditarBanco(id);
    }

    const handleGuardarBanco = async (id) => {
        try {
            await axios.patch(`http://localhost:4500/banco/${id}`, bancos.find(banco => banco.id === id));
            setEditarBanco(null);
        } catch (error) {
            console.log('Error al guardar cambios:', error);
        }
    }

    const handleCancelarBanco = () => {
        setEditarBanco(null);
        axios.get('http://localhost:4500/banco')
            .then(response => setBancos(response.data))
            .catch(error => console.error(error));
    };

    const handleInputChange = (e, id, campo) => {
        const newValue = e.target.value;
        setBancos(prevState =>
            prevState.map(banco =>
                banco.id === id ? { ...banco, [campo]: newValue } : banco
            )
        );
    }

    const handleEliminarBanco = async (id) => {
        try {
            await axios.delete(`http://localhost:4500/banco/${id}`);
            setBancos(prevState => prevState.filter(banco => banco.id !== id));
        } catch (error) {
            console.log('Error al eliminar banco:', error);
        }
    }

    const handleAñadirBanco = () => {
        setModalBancoOpen(true);
    }

    const handleCancelarAñadirBanco = () => {
        setModalBancoOpen(false);
        setNuevoBanco({
            nom_ban: '',
            log_ban: '',
            tas_ban: ''
        });
    }

    const handleInputChangeNuevoBanco = (e, campo) => {
        const newValue = e.target.value;
        setNuevoBanco(prevState => ({
            ...prevState,
            [campo]: newValue
        }));
    }

    const handleSubmitNuevoBanco = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4500/banco', nuevoBanco);
            setBancos(prevState => [...prevState, response.data]);
            setNuevoBanco({
                nom_ban: '',
                log_ban: '',
                tas_ban: ''
            });
        } catch (error) {
            console.log('Error al añadir banco:', error);
        }
        setModalBancoOpen(false);
    }

    /* ------------------------------------------------------------------------ */

    const handleSeleccionarCredito = (id) => {
        setCreditoSeleccionado(id);
    }

    const handleEditarCredito = (id) => {
        setEditarCredito(id);
    }

    const handleGuardarCredito = async (id) => {
        try {
            await axios.patch(`http://localhost:4500/tipo-credito/${id}`, creditos.find(credito => credito.id === id));
            setEditarCredito(null);
        } catch (error) {
            console.log('Error al guardar cambios:', error);
        }
    }

    const handleCancelarCredito = () => {
        setEditarCredito(null);
        axios.get(`http://localhost:4500/tipo-credito?bancoId=${bancoSeleccionado}`)
            .then(response => setCreditos(response.data))
            .catch(error => console.error(error));
    }

    const handleInputChangeCredito = (e, id, campo) => {
        const newValue = e.target.value;
        setCreditos(prevState =>
            prevState.map(credito =>
                credito.id === id ? { ...credito, [campo]: newValue } : credito
            )
        );
    }

    const handleEliminarCredito = async (id) => {
        try {
            await axios.delete(`http://localhost:4500/tipo-credito/${id}`);
            setCreditos(prevState => prevState.filter(credito => credito.id !== id));
        } catch (error) {
            console.log('Error al eliminar crédito:', error);
        }
    }

    const handleAñadirCredito = () => {
        if (!bancoSeleccionado) {
            alert('Seleccione un banco primero para poder agregar un nuevo credito');
            return;
        }
        setModalCreditoOpen(true);
    }

    const handleCancelarAñadirCredito = () => {
        setModalCreditoOpen(false);
        setNuevoCredito({
            nom_cre: '',
            int_cre: '',
            bancoId: ''
        });
    }

    const handleInputChangeNuevoCredito = (e, campo) => {
        const newValue = e.target.value;
        setNuevoCredito(prevState => ({
            ...prevState,
            [campo]: newValue
        }));
    }

    const handleSubmitNuevoCredito = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4500/tipo-credito', {
                ...nuevoCredito,
                bancoId: bancoSeleccionado
            });
            setCreditos(prevState => [...prevState, response.data]);
            setNuevoCredito({
                nom_cre: '',
                int_cre: '',
                bancoId: ''
            });
        } catch (error) {
            console.log('Error al añadir crédito:', error);
        }
        setModalCreditoOpen(false);
    }

    /* ------------------------------------------------------------------------ */

    const handleEditarCobro = (id) => {
        setEditarCobro(id);
    }

    const handleGuardarCobro = async (id) => {
        try {
            await axios.patch(`http://localhost:4500/cobro/${id}`, cobros.find(cobro => cobro.id === id));
            setEditarCobro(null);
        } catch (error) {
            console.log('Error al guardar cambios:', error);
        }
    }

    const handleCancelarCobro = () => {
        setEditarCobro(null);
        axios.get(`http://localhost:4500/cobro?creditoId=${creditoSeleccionado}`)
            .then(response => setCobros(response.data))
            .catch(error => console.error(error));
    }

    const handleInputChangeCobro = (e, id, campo) => {
        const newValue = e.target.value;
        setCobros(prevState =>
            prevState.map(cobro =>
                cobro.id === id ? { ...cobro, [campo]: newValue } : cobro
            )
        );
    }

    const handleEliminarCobro = async (id) => {
        try {
            await axios.delete(`http://localhost:4500/cobro/${id}`);
            setNuevoCobro(prevState => prevState.filter(cobro => cobro.id !== id));
        } catch (error) {
            console.log('Error al eliminar el cobro:', error);
        }
    }

    const handleAñadirCobro = () => {
        if (!bancoSeleccionado) {
            alert('Seleccione un banco para agregar un cobro');
            return;
        }
        if (!creditoSeleccionado) {
            alert('Seleccione un credito para poder agregar un cobro');
            return;
        }
        setModalCobroOpen(true);
    }

    const handleCancelarAñadirCobro = () => {
        setModalCobroOpen(false);
        setNuevoCobro({
            nom_cre: '',
            int_cre: '',
            bancoId: ''
        });
    }

    const handleInputChangeNuevoCobro = (e, campo) => {
        const newValue = e.target.value;
        setNuevoCobro(prevState => ({
            ...prevState,
            [campo]: newValue
        }));
    }

    const handleSubmitNuevoCobro = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4500/cobro', {
                ...nuevoCobro,
                creditoId: creditoSeleccionado
            });
            setCobros(prevState => [...prevState, response.data]);
            setNuevoCobro({
                nom_cre: '',
                int_cre: '',
                bancoId: ''
            });
        } catch (error) {
            console.log('Error al añadir cobro:', error);
        }
        setModalCobroOpen(false);
    }

    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:4500/admin', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setIsLoggedIn(true);
                } else {
                    window.location.replace("/login");
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                window.location.replace("/login");
            }
        };

        checkAuth();
    }, []);
    if (!isLoggedIn) {
        return <div>Verificando...</div>;
    }

    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        window.location.replace("/login");
    };

    return (
        <div>
            <div className="bg-[#8db986] p-4 flex items-center justify-between">
                <a onClick={handleCerrarSesion}>
                    <button className="border-2 border-black bg-[#8c2318] rounded-xl w-32 h-10">Cerrar Sesión</button>
                </a>
                <h1 className="text-white font-extrabold text-5xl text-center uppercase font-serif">Admin</h1>
                <div className='w-40'></div>
            </div>
            <div>
                <div className='flex flex-col'>
                    {/* BANCO */}
                    <div className='m-4 border basis-1/2'>
                        <div className='flex m-2 relative justify-between'>
                            <h2 className='uppercase text-xl font-semibold font-mono m-6'>Bancos</h2>
                            <button className='border-2 border-black rounded-2xl p-2 bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] m-4 w-40 font-bold flex items-center justify-center space-x-2' onClick={handleAñadirBanco}>Añadir Banco <img className='h-6 w-6 ml-1 text-white' src="/svg/add.svg" alt="" /></button>
                        </div>
                        <div className='items-center m-4 h-36 overflow-y-scroll'>
                            <table className='border text-center justify-center w-full'>
                                <thead className='justify-center border'>
                                    <tr>
                                        <th className='border font-mono'>Nombre</th>
                                        <th className='border font-mono'>Logo</th>
                                        <th className='border font-mono'>Tasa de interés</th>
                                        <th className='border font-mono'>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bancos.map(banco => (
                                        <tr key={banco.id}>
                                            <td className='px-4 py-2 text-center'>{editarBanco === banco.id ? <input className='border w-20 px-4 py-2 text-center' type="text" maxLength={25} minLength={4} value={banco.nom_ban} onChange={(e) => handleInputChange(e, banco.id, 'nom_ban')} /> : banco.nom_ban}</td>
                                            <td className='px-4 py-2 text-center'>{editarBanco === banco.id ? <input className='border w-20 px-4 py-2 text-center' type="text" value={banco.log_ban} onChange={(e) => handleInputChange(e, banco.id, 'log_ban')} /> : <img className='w-20 mx-auto' src={banco.log_ban} alt="" />}</td>
                                            <td className='px-4 py-2 text-center'>{editarBanco === banco.id ? <input className='border w-20 px-4 py-2 text-center' type="number" maxLength={5} minLength={1} min={0.1} value={banco.tas_ban} onChange={(e) => handleInputChange(e, banco.id, 'tas_ban')} /> : banco.tas_ban}</td>
                                            <td>
                                                {editarBanco === banco.id ? (
                                                    <>
                                                        <button className='align-middle items-center justify-center mr-4' onClick={(e) => handleGuardarBanco(banco.id, e)}><img className='h-6 w-6' src="/svg/save.svg" alt="" /></button>
                                                        <button className='align-middle items-center justify-center ml-4' onClick={handleCancelarBanco}><img className='h-6 w-6' src="/svg/cancel.svg" alt="" /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className='align-middle items-center justify-center mr-4' onClick={() => handleEditarBanco(banco.id)}>
                                                            <img className='h-6 w-6' src="/svg/edit.svg" alt="" />
                                                        </button>
                                                        <button className='align-middle items-center justify-center ml-4 mr-4' onClick={() => handleEliminarBanco(banco.id)}> <img className='h-6 w-6' src="/svg/delete.svg" alt="" /> </button>
                                                        <button className='align-middle items-center justify-center ml-4' onClick={() => handleSeleccionarBanco(banco.id)}>{bancoSeleccionado === banco.id ? (
                                                            <img className='h-6 w-6' src="/svg/selected-green.svg" alt="" />) : (
                                                            <img className='h-6 w-6' src="/svg/selected-black.svg" alt="" />
                                                        )}</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Modal className="bg-[#8db986] rounded-lg p-6 mt-36 w-96 mx-auto border-2 border-black" isOpen={modalBancoIsOpen} onRequestClose={handleCancelarAñadirBanco}>
                            <h2 className="text-2xl font-semibold mb-4">Añadir Banco</h2>
                            <form onSubmit={handleSubmitNuevoBanco}>
                                <div className="mb-4">
                                    <label htmlFor="nom_ban" className="text-sm font-semibold inline-block">Nombre: <img className='h-6 w-6 inline-block mb-1' src="/svg/bank.svg" alt="" /></label>
                                    <input maxLength={25} minLength={4} type="text" id="nom_ban" value={nuevoBanco.nom_ban} onChange={(e) => handleInputChangeNuevoBanco(e, 'nom_ban')} className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="log_ban" className="text-sm font-semibold inline-block">Logo: <img className='h-4 w-4 inline-block mb-1' src="/svg/file-url.svg" alt="" /></label>
                                    <input type="text" id="log_ban" value={nuevoBanco.log_ban} onChange={(e) => handleInputChangeNuevoBanco(e, 'log_ban')} className="w-full mt-1 p-2 border rounded-md" />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="tas_ban" className="text-sm font-semibold inline-block">Tasa de interés: <img className='h-3 w-3 inline-block' src="/svg/percent.svg" alt="" /></label>
                                    <input
                                        type="number"
                                        id="tas_ban"
                                        value={nuevoBanco.tas_ban}
                                        onChange={(e) => handleInputChangeNuevoBanco(e, 'tas_ban')}
                                        className="w-full mt-1 p-2 border rounded-md"
                                        step="0.01"
                                        min="0.1"
                                        pattern="[0-9]+(\.[0-9]+)?"
                                        max="100.00"
                                        title="Ingresa un número válido con hasta un decimal"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">Agregar</button>
                                    <button type="button" onClick={handleCancelarAñadirBanco} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancelar</button>
                                </div>
                            </form>
                        </Modal>
                    </div>

                    <div className='m-4 border flex flex-row'>
                        {/* CREDITO */}
                        <div className='m-4 border basis-1/2 '>
                            <div className='flex m-2 relative justify-between'>
                                <h2 className='uppercase text-xl font-semibold font-mono m-6'>Creditos</h2>
                                <button className='border-2 border-black rounded-2xl p-2 bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] m-4 w-40 font-bold flex items-center justify-center space-x-2' onClick={handleAñadirCredito}>Añadir Credito<img className='h-6 w-6 ml-1 text-white' src="/svg/add.svg" alt="" /></button>
                            </div>
                            <div className='items-center m-4 h-36 overflow-y-scroll'>
                                <table className='border text-center justify-center w-full'>
                                    <thead className='justify-center border'>
                                        <tr>
                                            <th className='border font-mono'>Nombre</th>
                                            <th className='border font-mono'>Interes</th>
                                            <th className='border font-mono'>Banco</th>
                                            <th className='border font-mono'>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {creditos.map(credito => (
                                            <tr key={credito.id}>
                                                <td className='px-4 py-2 text-center'>
                                                    {editarCredito === credito.id ? (
                                                        <input className='border w-20 px-4 py-2 text-center' type="text" maxLength={25} minLength={4} value={credito.nom_cre} onChange={(e) => handleInputChangeCredito(e, credito.id, 'nom_cre')} />
                                                    ) : (
                                                        credito.nom_cre
                                                    )}
                                                </td>
                                                <td className='px-4 py-2 text-center'>
                                                    {editarCredito === credito.id ? (
                                                        <input className='border w-20 px-4 py-2 text-center' type="number" maxLength={5} minLength={1} min={0.1} value={credito.int_cre} onChange={(e) => handleInputChangeCredito(e, credito.id, 'int_cre')} />
                                                    ) : (
                                                        credito.int_cre
                                                    )}
                                                </td>
                                                <td className='px-4 py-2 text-center'>
                                                    {editarCredito === credito.id ? (
                                                        bancos.find(banco => banco.id === credito.bancoId)?.nom_ban || "Nombre no encontrado"
                                                    ) : (
                                                        bancos.find(banco => banco.id === credito.bancoId)?.nom_ban || "Nombre no encontrado"
                                                    )}
                                                </td>
                                                <td>
                                                    {editarCredito === credito.id ? (
                                                        <>
                                                            <button className='align-middle items-center justify-center mr-4' onClick={(e) => handleGuardarCredito(credito.id, e)}><img className='h-6 w-6' src="/svg/save.svg" alt="" /></button>
                                                            <button className='align-middle items-center justify-center ml-4' onClick={handleCancelarCredito}><img className='h-6 w-6' src="/svg/cancel.svg" alt="" /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className='align-middle items-center justify-center mr-4' onClick={() => handleEditarCredito(credito.id)}>
                                                                <img className='h-6 w-6' src="/svg/edit.svg" alt="" />
                                                            </button>
                                                            <button className='align-middle items-center justify-center ml-4 mr-4' onClick={() => handleEliminarCredito(credito.id)}> <img className='h-6 w-6' src="/svg/delete.svg" alt="" /> </button>
                                                            <button className='align-middle items-center justify-center ml-4' onClick={() => handleSeleccionarCredito(credito.id)}> {creditoSeleccionado === credito.id ? (<img className='h-6 w-6' src="/svg/selected-green.svg" alt="" />) : (<img className='h-6 w-6' src="/svg/selected-black.svg" alt="" />)}</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Modal className="bg-[#8db986] rounded-lg p-6 mt-36 w-96 mx-auto border-2 border-black" isOpen={modalCreditoIsOpen} onRequestClose={handleCancelarAñadirCredito}>
                                <h2 className="text-2xl font-semibold mb-4">Añadir Credito</h2>
                                <form onSubmit={handleSubmitNuevoCredito}>
                                    <div className="mb-4">
                                        <label htmlFor="nom_cre" className="text-sm font-semibold inline-block">Nombre:</label>
                                        <input maxLength={25} minLength={4} type="text" id="nom_cre" value={nuevoCredito.nom_cre} onChange={(e) => handleInputChangeNuevoCredito(e, 'nom_cre')} className="w-full mt-1 p-2 border rounded-md" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="int_cre" className="text-sm font-semibold inline-block">Tasa de interés: <img className='h-3 w-3 inline-block' src="/svg/percent.svg" alt="" /></label>
                                        <input
                                            type="number"
                                            id="int_cre"
                                            value={nuevoCredito.int_cre}
                                            onChange={(e) => handleInputChangeNuevoCredito(e, 'int_cre')}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            step="0.01"
                                            min="0.1"
                                            pattern="[0-9]+(\.[0-9]+)?"
                                            max="100.00"
                                            title="Ingresa un número válido con hasta un decimal"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="bancoId" className="text-sm font-semibold inline-block">Banco: <img className='h-5 w-5 inline-block mb-1' src="/svg/bank.svg" alt="" /></label>
                                        <input type="text" id="bancoId" readOnly value={bancos.find(banco => banco.id === bancoSeleccionado)?.nom_ban || ''} className="w-full mt-1 p-2 border rounded-md" />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">Agregar</button>
                                        <button type="button" onClick={handleCancelarAñadirCredito} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancelar</button>
                                    </div>
                                </form>
                            </Modal>
                        </div>

                        {/* Cobro */}
                        <div className='m-4 border basis-1/2 '>
                            <div className='flex m-2 relative justify-between'>
                                <h2 className='uppercase text-xl font-semibold font-mono m-6'>Cobros Indirectos</h2>
                                <button className='border-2 border-black rounded-2xl p-2 bg-[#94ba65] text-white hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-[#94ba65] m-4 w-40 font-bold flex items-center justify-center space-x-2' onClick={handleAñadirCobro}>Añadir Cobro<img className='h-6 w-6 ml-1 text-white' src="/svg/add.svg" alt="" /></button>
                            </div>
                            <div className='items-center m-4 h-36 overflow-y-scroll'>
                                <table className='border text-center justify-center w-full'>
                                    <thead className='justify-center border'>
                                        <tr>
                                            <th className='border font-mono'>Nombre</th>
                                            <th className='border font-mono'>Cobro</th>
                                            <th className='border font-mono'>Credito</th>
                                            <th className='border font-mono'>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cobros.map(cobro => (
                                            <tr key={cobro.id}>
                                                <td className='px-4 py-2 text-center'>
                                                    {editarCobro === cobro.id ? (
                                                        <input className='border w-20 px-4 py-2 text-center' type="text" maxLength={25} minLength={4} value={cobro.nom_cob} onChange={(e) => handleInputChangeCobro(e, cobro.id, 'nom_cob')} />
                                                    ) : (
                                                        cobro.nom_cob
                                                    )}
                                                </td>

                                                <td className='px-4 py-2 text-center'>
                                                    {editarCobro === cobro.id ? (
                                                        <input className='border w-20 px-4 py-2 text-center' type="number" maxLength={5} minLength={1} min={0.1} value={cobro.int_cob} onChange={(e) => handleInputChangeCobro(e, cobro.id, 'int_cob')} />
                                                    ) : (
                                                        cobro.int_cob
                                                    )}
                                                </td>

                                                <td className='px-4 py-2 text-center'>
                                                    {editarCobro === cobro.id ? (
                                                        creditos.find(credito => credito.id === cobro.creditoId)?.nom_cre || "Nombre no encontrado"
                                                    ) : (
                                                        creditos.find(credito => credito.id === cobro.creditoId)?.nom_cre || "Nombre no encontrado"
                                                    )}
                                                </td>

                                                <td>
                                                    {editarCobro === cobro.id ? (
                                                        <>
                                                            <button className='align-middle items-center justify-center mr-4' onClick={(e) => handleGuardarCobro(cobro.id, e)}><img className='h-6 w-6' src="/svg/save.svg" alt="" /></button>
                                                            <button className='align-middle items-center justify-center ml-4' onClick={handleCancelarCobro}><img className='h-6 w-6' src="/svg/cancel.svg" alt="" /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className='align-middle items-center justify-center mr-4' onClick={() => handleEditarCobro(cobro.id)}>
                                                                <img className='h-6 w-6' src="/svg/edit.svg" alt="" />
                                                            </button>
                                                            <button className='align-middle items-center justify-center ml-4 mr-4' onClick={() => handleEliminarCobro(cobro.id)}> <img className='h-6 w-6' src="/svg/delete.svg" alt="" /> </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Modal className="bg-[#8db986] rounded-lg p-6 mt-36 w-96 mx-auto border-2 border-black" isOpen={modalCobroIsOpen} onRequestClose={handleCancelarAñadirCobro}>
                                <h2 className="text-2xl font-semibold mb-4">Añadir Cobro</h2>
                                <form onSubmit={handleSubmitNuevoCobro}>
                                    <div className="mb-4">
                                        <label htmlFor="nom_cob" className="text-sm font-semibold inline-block">Nombre:</label>
                                        <input maxLength={25} minLength={4} type="text" id="nom_cre" value={nuevoCobro.nom_cob} onChange={(e) => handleInputChangeNuevoCobro(e, 'nom_cob')} className="w-full mt-1 p-2 border rounded-md" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="int_cre" className="text-sm font-semibold inline-block">Tasa de interés: <img className='h-3 w-3 inline-block' src="/svg/percent.svg" alt="" /></label>
                                        <input
                                            type="number"
                                            id="int_cob"
                                            value={nuevoCobro.int_cob}
                                            onChange={(e) => handleInputChangeNuevoCobro(e, 'int_cob')}
                                            className="w-full mt-1 p-2 border rounded-md"
                                            step="0.01"
                                            min="0.1"
                                            pattern="[0-9]+(\.[0-9]+)?"
                                            max="100.00"
                                            title="Ingresa un número válido con hasta un decimal"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="creditoId" className="text-sm font-semibold inline-block">Credito: <img className='h-5 w-5 inline-block mb-1' src="/svg/bank.svg" alt="" /></label>
                                        <input type="text" id="creditoId" value={creditos.find(credito => credito.id === creditoSeleccionado)?.nom_cre || ''} className="w-full mt-1 p-2 border rounded-md" />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">Agregar</button>
                                        <button type="button" onClick={handleCancelarAñadirCobro} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">Cancelar</button>
                                    </div>
                                </form>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}