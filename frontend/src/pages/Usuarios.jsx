import React, { useEffect, useState } from 'react';

const Usuarios = () => {
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/unidades', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text(); // Obtener cuerpo de la respuesta como texto
                    throw new Error(`Error: ${response.status} - ${errorText}`); // Lanza un error con el texto de la respuesta
                }

                const data = await response.json(); // Intenta parsear como JSON
                setUnidades(data);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUnidades();
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Unidades</h1>
            <table>
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
                    {unidades.map(unidad => (
                        <tr key={unidad.id_unidad}>
                            <td>{unidad.id_unidad}</td>
                            <td>{unidad.marca}</td>
                            <td>{unidad.vehiculo}</td>
                            <td>{unidad.modelo}</td>
                            <td>{unidad.color}</td>
                            <td>{unidad.placa}</td>
                            <td>{unidad.placa_vigencia}</td>
                            <td>{unidad.no_poliza}</td>
                            <td>{unidad.garantia_vigencia}</td>
                            <td>{unidad.aseguradora}</td>
                            <td>{unidad.chofer_asignado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Usuarios;