import React, { useEffect, useState } from "react";
import './Unidades.css';
import './Garantias.css';
const Garantias = () => {
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGarantias = async () => {
      try {
        const response = await fetch("http://192.168.254.158:5000/api/garantias", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setGarantias(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGarantias();
  }, []);

  if (loading) return <p>Cargando garantías...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="garantias-container">
      <h1><i className="fa-solid fa-file-shield"></i> Garantías</h1>
       <div className="table-wrapper">
      <table className="elegant-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Unidad</th>
            <th>Marca</th>
            <th>Vehículo</th>
            <th>Aseguradora</th>
            <th>Tipo de Garantía</th>
            <th>No. de Póliza</th>
            <th>URL de Póliza</th>
            <th>Suma Asegurada</th>
            <th>Inicio Vigencia</th>
            <th>Vigencia</th>
            <th>Prima</th>
          </tr>
        </thead>
        <tbody>
          {garantias.map((g) => (
            <tr key={g.id_garantia}>
              <td>{g.id_garantia}</td>
              <td>{g.id_unidad}</td>
              <td>{g.marca}</td>
              <td>{g.vehiculo}</td>
              <td>{g.aseguradora}</td>
              <td>{g.tipo_garantia}</td>
              <td>{g.no_poliza}</td>
              <td>
                {g.url_poliza ? (
                  <a
                    href={g.url_poliza}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver Póliza
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>${g.suma_asegurada?.toLocaleString()}</td>
              <td>{g.inicio_vigencia}</td>
              <td>{g.vigencia}</td>
              <td>${g.prima?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Tarjetas para pantallas pequeñas */}
<div className="card-wrapper">
  {garantias.map(g => (
    <div key={g.id_garantia} className="unidad-card">
      <h3>{g.tipo_garantia} ({g.aseguradora})</h3>
      <p><b>ID Garantía:</b> {g.id_garantia}</p>
      <p><b>ID Unidad:</b> {g.id_unidad}</p>
      <p><b>Número de Póliza:</b> {g.no_poliza}</p>
      <p><b>URL Póliza:</b> 
        {g.url_poliza ? (
          <a href={g.url_poliza} target="_blank" rel="noopener noreferrer">
            Ver documento
          </a>
        ) : (
          "No disponible"
        )}
      </p>
      <p><b>Suma Asegurada:</b> ${g.suma_asegurada}</p>
      <p><b>Inicio Vigencia:</b> {new Date(g.inicio_vigencia).toLocaleDateString()}</p>
      <p><b>Vigencia:</b> {new Date(g.vigencia).toLocaleDateString()}</p>
      <p><b>Prima:</b> ${g.prima}</p>

      <div className="actions-container">
        {/* ACTUALIZAR (Verde) */}
        <button onClick={() => { setGarantiaToEdit(g); setShowModal(true); }}>
          <i className="fa-solid fa-pen-to-square icon-edit"></i>
        </button>

        {/* ELIMINAR (Rojo) */}
        <button onClick={() => handleDeleteGarantia(g.id_garantia)}>
          <i className="fa-solid fa-trash icon-delete"></i>
        </button>

        {/* DETALLES/MÁS DATOS (Azul) */}
        <button onClick={() => { setModalData(g); setShowModal(true); }}>
          <i className="fa-solid fa-plus-minus icon-details"></i>
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
    
  );
};

export default Garantias;
