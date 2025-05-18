import React, {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import { fetchWorkoutById, fetchAllExercises, deleteWorkout, deleteExerciseFromWorkout  } from "../../api/workoutService";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import WorkoutFormModal from "../modals/WorkoutFormModal";
import ExerciseFormModal from "../modals/ExerciseFormModal";
import Header from "../Header";
import { FiTrash2, FiEdit } from "react-icons/fi";



function WorkoutDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exercisesMap, setExercisesMap] = useState({});
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [showDeleteWorkoutModal, setShowDeleteWorkoutModal] = useState(false);
    const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
    const [deletingExerciseId, setDeletingExerciseId] = useState(null);


    useEffect(() => {
        Promise.all([
            fetchWorkoutById(id),
            fetchAllExercises()
        ])
            .then(([WorkoutData, allExercises]) => {
                setWorkout(WorkoutData);
                const map = {};
                allExercises.forEach(ex => {map[ex.id] = ex.název; });
                setExercisesMap(map)
                setLoading(false);
            })
            .catch(err => {
                console.error('Chyba při načítání', err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!workout) {
        return (
            <Container className="py-4">
                <p>Workout nenalezen</p>
                <Button variant="secondary" onClick={() => navigate(-1)}>Zpět</Button>
            </Container>
        );
    }

    // výpočty shrnutí
    const exercisesCount = workout.workoutExercises.length;
    const setsCount = workout.workoutExercises.reduce((sum, ex) => sum + ex.sets, 0);
    const weightCount = workout.workoutExercises.reduce(
        (sum, ex) => sum + ex.sets * ex.repetitions * ex.weight,
        0
    );

    return (
        <Container className="py-4">
            <Header />
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <Card.Title>{workout.název}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                {new Date(workout.datum).toLocaleDateString('cs-CZ')}
                            </Card.Subtitle>
                        </div>
                        <div>
                                <Button variant="link" onClick={() => setShowWorkoutModal(true)} title="Upravit">
                                    <FiEdit size={20} />
                                </Button>

                                <Button variant="link" className="text-danger ms-2" onClick={() => setShowDeleteWorkoutModal(true)} title="Smazat">
                                    <FiTrash2 size={20} />
                                </Button>
                        </div>
                    </div>
                    <Card.Text>{workout.popis}</Card.Text>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Analýza workoutu</h5>
            </div>

            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-around">
                        <div>
                            <h5>Cviky</h5>
                            <p>{exercisesCount}</p>
                        </div>
                        <div>
                            <h5>Sety</h5>
                            <p>{setsCount}</p>
                        </div>
                        <div>
                            <h5>Váha</h5>
                            <p>{weightCount.toFixed(1)} kg</p>
                        </div>
                    </div>
                {/*<Card.Title>Analýza workoutu</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item>Cviků: {exercisesCount}</ListGroup.Item>
                    <ListGroup.Item>Setů: {setsCount}</ListGroup.Item>
                    <ListGroup.Item>Celková váha: {weightCount.toFixed(1)} kg</ListGroup.Item>
                </ListGroup> */}
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Seznam cviků</h5>
                <Button variant="primary" 
                    onClick={() => {setEditingExercise(null); setShowExerciseModal(true); }} title="Přidat cvik">
                    + Cvik
                </Button>
            </div>

            <ListGroup>
                {workout.workoutExercises.length === 0 ? (
                    <p className="text-center my-4">
                        V tomto workoutu nejsou zapsané žádné cviky.
                    </p>
                ) : (    
                    workout.workoutExercises.map(ex => (
                        <ListGroup.Item key={ex.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{exercisesMap[ex.exerciseId] || ex.exerciseId}</strong>
                                <div>
                                    <small>{ex.sets} setů | {ex.repetitions} opakování | {ex.weight} kg</small> 
                                </div>
                            </div>
                            <div>
                                <Button variant="link" onClick={() => {setEditingExercise(ex); setShowExerciseModal(true); }} className="me-2" title="Upravit">
                                    <FiEdit size={15} />
                                </Button>
                                <Button variant="link" className="text-danger" onClick={() => {
                                    setDeletingExerciseId(ex.id); setShowDeleteExerciseModal(true);
                                    }}
                                    title="Smazat"
                                    >
                                    <FiTrash2 size={15} />
                                </Button>
                            </div>
                        </ListGroup.Item>
                    )))}      
            </ListGroup>

            {/* Modály pro cvik*/}
            {showExerciseModal && (
                <ExerciseFormModal
                show
                workoutId={id}
                exercise={editingExercise}
                onHide={() => setShowExerciseModal(false)}
                onSaved={savedEx => {
                    setWorkout(prev => ({
                        ...prev,
                        workoutExercises: editingExercise
                            ? prev.workoutExercises.map(e => e.id === savedEx.id ? savedEx : e)
                            : [...prev.workoutExercises, savedEx]
                        }));
                        setShowExerciseModal(false);
                    }}
                />
            )}

            {/* ConfirmDeleteModal pro workout */}
            {showDeleteWorkoutModal && (
                <ConfirmDeleteModal
                    show={showDeleteWorkoutModal}
                    title="Smazat workout"
                    body={`Oravdu chcete smazat workout „${workout.název}“?`}
                    onHide={() => setShowDeleteWorkoutModal(false)}
                    onConfirm={async () => {
                        await deleteWorkout(workout.id);
                        setShowDeleteWorkoutModal(false);
                        navigate('/');
                    }}
                />    
            )}

            {/* ConfirmDeleteModal pro cviky */}
            {showDeleteExerciseModal && (
                <ConfirmDeleteModal
                    show={showDeleteExerciseModal}
                    title="Smazat cvik"
                    body="Opravdu chcete smazat tento cvik z workoutu?"
                    onHide={() => setShowDeleteExerciseModal(false)}
                    onConfirm={async () => {
                        await deleteExerciseFromWorkout(workout.id, deletingExerciseId);
                        setWorkout(prev => ({
                            ...prev,
                            workoutExercises: prev.workoutExercises.filter(e => e.id !== deletingExerciseId)
                        }));
                        setShowDeleteExerciseModal(false);
                    }}
                />    
            )}

            {/* showWorkoutModal pro workout */}
            {showWorkoutModal && (
                <WorkoutFormModal
                    show={true}
                    workout={workout}
                    onHide={() => setShowWorkoutModal(false)}
                    onSaved={updatedWorkout => {
                        console.log('🔄 onSaved updatedWorkout:', updatedWorkout);
                        setWorkout(updatedWorkout);
                        setShowWorkoutModal(false);
                    }}
                />
            )}

        </Container>
    );
}

export default WorkoutDetail;