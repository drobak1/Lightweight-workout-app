import React, { useState, useEffect } from "react";
import { Container, Button, ListGroup } from 'react-bootstrap';
import DateRangePicker from "../shared/DateRangePicker";
import { fetchWorkoutsInRange, createWorkout } from "../../api/workoutService";
import WorkoutFormModal from "../modals/WorkoutFormModal";
import Header from "../Header";


function Dashboard() {
    const today = new Date();

    const [startDate, setStartDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    );
    const [endDate, setEndDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6)
    );
    const [workouts, setWorkouts] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (startDate && endDate) {
            const from = startDate.toISOString().slice(0, 10); //YYYY-MM-DD
            const to = endDate.toISOString().slice(0, 10);
            console.log('🔍 loading workouts from', from, 'to', to);
            fetchWorkoutsInRange(from, to)
                .then(data => {
                    console.log('✅ fetched workouts:', data);
                    setWorkouts(data);
                })
                .catch(err => console.error('✖ fetchWorkoutsInRange error', err));
        }
    }, [startDate, endDate]);

    //výpočty pro týdenní shrnutí
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce((sum, w) => sum + w.workoutExercises.length, 0);
    const totalSets = workouts.reduce(
        (sum, w) => sum + w.workoutExercises.reduce((s, ex) => s + ex.sets, 0),
        0
    );
    const totalWeight = workouts.reduce(
        (sum, w) => sum + w.workoutExercises.reduce(
            (s, ex) => s + ex.sets * ex.repetitions * ex.weight,
            0
        ),
        0
    );



    return (
        <Container className="py-4">
            <header className="d-flex justify-content-between align-items-center mb-4">
                <Header />
            </header>

            {/* DateRangePicker */}
            <Container className="d-flex justify-content-between align-items-center mb-4">
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDatesChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                />

                <Button variant="primary" onClick={() => setShowCreateModal(true)} title="Vytvořit workout">
                    + Workout
                </Button>
            </Container>



            {/* týdenní shrnutí */}
            <div className="my=4 d-flex justify-content-around">
                <div>
                    <h5>Workouty</h5>
                    <p>{totalWorkouts}</p>
                </div>
                <div>
                    <h5>Cviky</h5>
                    <p>{totalExercises}</p>
                </div>
                <div>
                    <h5>Sety</h5>
                    <p>{totalSets}</p>
                </div>
                <div>
                    <h5>Váha</h5>
                    <p>{totalWeight.toFixed(1)} kg</p>
                </div>
            </div>
            
            {/* Seznam workoutů */}
            <ListGroup className="mt-3">
                {workouts.length === 0 ? (
                    <p className="text-center my-4">
                        V tomto období nejsou zapsané žádné workouty.
                    </p>
                ) : (    
                    workouts.map(workout => {
                        const exCount = workout.workoutExercises.length;
                        const setsCount = workout.workoutExercises.reduce((s, ex) => s + ex.sets, 0);
                        const weightCount = workout.workoutExercises.reduce(
                        (s, ex) => s + ex.sets * ex.repetitions * ex.weight,
                        0
                        );
                        const date = new Date(workout.datum);
                        const formattedDate = date.toLocaleDateString('cs-CZ');

                        return (
                            <ListGroup.Item
                                key={workout.id}
                                action
                                onClick={() => window.location.href = `/workout/${workout.id}`}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{workout.název}</strong> <span className="text-muted">{formattedDate}</span>
                                    </div>
                                    <div className="text-end">
                                        <small>{exCount} cviků | {setsCount} setů | {weightCount.toFixed(1)} kg</small>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        );
                    }))}
            </ListGroup>

            {/* --- Modál pro vytvoření nového workoutu --- */}
            {showCreateModal && (
                <WorkoutFormModal
                    show
                    workout={null}
                    onHide={() => setShowCreateModal(false)}
                    onSaved={newWorkout => {
                        setWorkouts(prev => [...prev, newWorkout]);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </Container>
    );
}

export default Dashboard;