import React from 'react';
import ClientContacts from '../projects/ClientContacts';

const ClientContactsModal = ({ isOpen, onClose, client }) => {
    if (!isOpen || !client) return null;

    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
        },
        content: {
            background: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
        header: {
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: 0,
        },
        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
            padding: '0.5rem',
            lineHeight: 1,
        },
        body: {
            padding: '1.5rem',
        },
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>Contacts: {client.name}</h2>
                    <button style={modalStyles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div style={modalStyles.body}>
                    <ClientContacts clientId={client.id} />
                </div>
            </div>
        </div>
    );
};

export default ClientContactsModal;
