// src/components/modals/WorkoutFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createWorkout, updateWorkout } from '../../api/workoutService';

/**
 * Modal pro vytvoření nebo úpravu workoutu.
 * Props:
 *  - show (bool)
 *  - workout (object|null)
 *  - onHide (fn)
 *  - onSaved (fn) zavolat s novým/ne aktualizovaným workoutem
 */
function WorkoutFormModal({ show, workout, onHide, onSaved }) {
  // Rozlišujeme editaci vs. tvorbu
  const isEdit = Boolean(workout);
  // Výchozí hodnoty
  const [name, setName]   = useState(isEdit ? workout.název : '');
  const [date, setDate]   = useState(
    isEdit
      ? workout.datum
      : new Date().toISOString().slice(0, 10)  // dnešní datum YYYY-MM-DD
  );
  const [desc, setDesc]   = useState(isEdit ? (workout.popis || '') : '');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Při otevření modálu zaktualizujeme state, pokud se změní prop `workout`
  useEffect(() => {
    setName(isEdit ? workout.název : '');
    setDate(isEdit ? workout.datum : new Date().toISOString().slice(0, 10));
    setDesc(isEdit ? (workout.popis || '') : '');
    setErrors({});
  }, [workout]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Název je povinný.';
    else if (name.length > 30) errs.name = 'Název nesmí mít více než 30 znaků.';
    if (desc.length > 150) errs.desc = 'Popis nesmí mít více než 150 znaků.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };



  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    console.log('🔔 handleSubmit triggered', { name, date, desc });
    setSaving(true);
    try {
      let result;
      const payload = { název: name, datum: date, popis: desc };
      console.log('→ Creating workout with payload', payload);
      if (isEdit) {
        result = await updateWorkout(workout.id, payload);
      } else {
        result = await createWorkout(payload);
      }
      console.log('← API returned', result);
      onSaved(result);
    } catch (err) {
      console.error('Chyba při načítání workoutů:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Upravit workout' : 'Vytvořit workout'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {/* Název */}
          <Form.Group className="mb-3" controlId='formName'>
            <Form.Label>Název*</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              isInvalid={!!errors.name}
              maxLength={30}
              placeholder='Max 30 znaků'
            />
            <Form.Control.Feedback type='invalid'>
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Datum */}

          <Form.Group className="mb-3">
            <Form.Label>Datum*</Form.Label>
            <Form.Control
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </Form.Group>

          {/* Popis */}

          <Form.Group className="mb-3">
            <Form.Label>Popis</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              isInvalid={!!errors.desc}
              maxLength={150}
              placeholder='Max 150 znaků'
            />
            <Form.Control.Feedback type='ivalid'>
              {errors.desc}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Zrušit
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Ukládám…' : isEdit ? 'Uložit změny' : 'Vytvořit'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default WorkoutFormModal;
