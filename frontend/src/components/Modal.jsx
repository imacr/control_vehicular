import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import './Modal.css'; // Asegúrate de que la ruta al CSS sea correcta

const Modal = ({ children, onClose }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del body

    return () => {
      document.body.style.overflow = prev; // Restaura el scroll al cerrar
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-contentido" 
        role="dialog" 
        aria-modal="true" 
        onClick={e => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          &times; {/* Icono de cerrar */}
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") // Asegúrate de que este div esté en tu index.html
  );
};

export default Modal;