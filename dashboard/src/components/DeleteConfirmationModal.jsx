import React from "react";
import "./deleteConfirmationModal.css";

const DeleteConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Are you sure you want to delete?</h3>
        <button onClick={onConfirm} className="confirm-button">
          Yes
        </button>
        <button onClick={onClose} className="cancel-button">
          No
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
