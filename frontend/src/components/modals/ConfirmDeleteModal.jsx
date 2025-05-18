import React from "react";
import { Modal, Button } from "react-bootstrap";

/**
 * Props:
 *  - show (bool)         – zda je modál otevřený
 *  - onHide (fn)         – zavolat, když uživatel klikne „Zrušit“
 *  - onConfirm (fn)      – zavolat, když uživatel potvrdí mazání
 *  - title (string)      – nadpis modálu, např. „Smazat workout“
 *  - body (string)       – text zprávy, např. „Opravdu chcete smazat tento workout?“
 */

function ConfirmDeleteModal({ show, onHide, onConfirm, title, body }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{body}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Zrušit
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Smazat
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDeleteModal;