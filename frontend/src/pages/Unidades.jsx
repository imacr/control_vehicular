import React, { useEffect, useState } from 'react';
import './Unidades.css';

const Usuarios = () => {
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPageOptions = [5, 10, 20];
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await fetch('http://192.168.254.158:5000/api/unidades');
                if (!response.ok) throw new Error('Error al obtener datos');
                const data = await response.json();
                setUnidades(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUnidades();
    }, []);

    if (loading) return <div className="mensaje-estado">Cargando...</div>;
    if (error) return <div className="mensaje-estado error">{error}</div>;

    // Calcular unidades para la página actual
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUnidades = unidades.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(unidades.length / itemsPerPage);

    return (
        <div className="unidades-container">
            
            <h1><i class="fa-solid fa-car-side"></i> Unidades</h1>

            {/* Selección de items por página */}
            <div className="pagination-controls">
                <label>
                    Mostrar:
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        {itemsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </label>
            </div>

            {/* Tabla para pantallas grandes */}
            <div className="table-wrapper">
                <table className="elegant-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Marca</th>
                            <th>Vehículo</th>
                            <th>Modelo</th>
                            <th>Color</th>
                            <th>Placa</th>
                            <th>Vigencia Placa</th>
                            <th>Poliza Garantía</th>
                            <th>Vigencia Garantía</th>
                            <th>Aseguradora</th>
                            <th>Chofer Asignado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUnidades.map(u => (
                            <tr key={u.id_unidad}>
                                <td>{u.id_unidad}</td>
                                <td>{u.marca}</td>
                                <td>{u.vehiculo}</td>
                                <td>{u.modelo}</td>
                                <td>{u.color}</td>
                                <td>{u.placa}</td>
                                <td>{u.placa_vigencia}</td>
                                <td>{u.no_poliza}</td>
                                <td>{u.garantia_vigencia}</td>
                                <td>{u.aseguradora}</td>
                                <td>{u.chofer_asignado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tarjetas para pantallas pequeñas */}
            <div className="card-wrapper">
                {currentUnidades.map(u => (
                    <div key={u.id_unidad} className="unidad-card">
                        <h3>{u.vehiculo} ({u.marca})</h3>
                        <p><b>ID:</b> {u.id_unidad}</p>
                        <p><b>Modelo:</b> {u.modelo}</p>
                        <p><b>Color:</b> {u.color}</p>
                        <p><b>Placa:</b> {u.placa}</p>
                        <p><b>Vigencia Placa:</b> {u.placa_vigencia}</p>
                        <p><b>Poliza:</b> {u.no_poliza}</p>
                        <p><b>Vigencia Garantía:</b> {u.garantia_vigencia}</p>
                        <p><b>Aseguradora:</b> {u.aseguradora}</p>
                        <p><b>Chofer:</b> {u.chofer_asignado}</p>
                    </div>
                ))}
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</button>
                <span>Página {currentPage} de {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </div>
    );
};

export default Usuarios;
