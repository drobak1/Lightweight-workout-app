import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { fetchAllExercises, addExerciseToWorkout, updateExerciseInWorkout } from '../../api/workoutService';

/**
 * props:
 *  - show (bool)
 *  - workoutId (string)
 *  - exercise (object|null)  ← null = přidávat, jinak editovat
 *  - onHide (fn)
 *  - onSaved (fn)            ← zavolej onSaved(upravený/ne nový cvik)
 */

export default function ExerciseFormModal({ show, workoutId, exercise, onHide, onSaved }) {
    const [list, setList] = useState([]);
    const [exId, setExId] = useState(exercise ? exercise.exerciseId : '');
    const [sets, setSets] = useState(exercise ? exercise.sets : 1);
    const [reps, setReps] = useState(exercise ? exercise.repetitions : 1);
    const [wt, setWt]     = useState(exercise ? exercise.weight : 0);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAllExercises()
            .then(arr => {
                console.log('✅ fetchAllExercises returned:', arr);
                if (Array.isArray(arr)) {
                    setList(arr);
                } else {
                    console.error('⚠️ Očekávali jsme pole, ale dostali jsme:', arr);
                }
            })
            .catch(err => console.error('✖ fetchAllExercises error:', err));
    }, []);

    //Validace 
    const validate = () => {
        const errs = {};
        if (!exId) errs.exId = 'Vyber prosím cvik.';
        if (sets < 1 || sets > 50) errs.sets = 'Sets musí být 1-50.';
        if (reps < 1 || reps > 100) errs.reps = 'Opakování musí být 1-100.';
        if (wt < 0.1 || wt > 1000) errs.wt = 'Váha musí být 0,1-1000 kg.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        const payload = { exerciseId: exId, sets, repetitions: reps, weight: wt };
        try {
            let saved;
            if (exercise) {
                saved = await updateExerciseInWorkout(workoutId, exercise.id, payload);
            } else {
                saved = await addExerciseToWorkout(workoutId, payload);
            }
            console.log('← API returned new exercise link:', saved);
            onSaved(saved);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{exercise ? 'Upravit cvik' : 'Přidat cvik'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="formExercise">
                        <Form.Label>Cvik*</Form.Label>
                        <Form.Select required 
                            value={exId} 
                            onChange={e => setExId(e.target.value)}
                            isInvalid={!!errors.exId}
                            >
                            <option value="">-- vyber --</option>
                            {Array.isArray(list)
                                ? list.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.název}</option>
                            )) : null}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.exId}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formSets">
                        <Form.Label>Počet setů*</Form.Label>
                        <Form.Control type="number" 
                         min={1} 
                         max={50}
                         value={sets} 
                         onChange={e => setSets(+e.target.value)} 
                         isInvalid={!!errors.sets}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.sets}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formReps">
                        <Form.Label>Opakování v setu*</Form.Label>
                        <Form.Control type="number" 
                         min={1} 
                         max={100}
                         value={reps} 
                         onChange={e => setReps(+e.target.value)} 
                         isInvalid={!!errors.reps}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.reps}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formWeight">
                        <Form.Label>Váha (kg)*</Form.Label>
                        <Form.Control type="number" 
                         min={0} 
                         max={1000}
                         step={0.1} 
                         value={wt} 
                         onChange={e => setWt(+e.target.value)} 
                         isInvalid={!!errors.wt}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.wt}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={saving}>Zrušit</Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Ukládám...' : (exercise ? 'Upravit' : 'Přidat')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}


