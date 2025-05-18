const API_BASE = 'http://localhost:3001';


//  Načte všechny workouty v zadaném rozsahu dat.


export async function fetchWorkoutsInRange(from, to) {
    const res = await fetch(`${API_BASE}/workouts?from=${from}&to=${to}`);
    if (!res.ok) throw new Error(`Chyba při načítání: ${res.status}`);
    return res.json();
}


// Načte detail jednoho workoutu podle ID.

export async function fetchWorkoutById(id) {
    const res = await fetch(`${API_BASE}/workouts/${id}`);
    if (!res.ok) throw new Error(`Chyba při načítání workoutu: ${res.status}`);
    return res.json();
  }
  

// Načte všechny dostupné cviky.

export async function fetchAllExercises() {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) throw new Error(`Chyba při načítání cviků: ${res.status}`);
    return res.json();
}

// Vytvoří nový workout.

export async function createWorkout(data) {
    const res = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Chyba při načítání cviků: ${res.status}`);
    return res.json();
}


// Aktualizuje existující workout.
 
export async function updateWorkout(id, data) {
    const res = await fetch(`${API_BASE}/workouts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Chyba při aktualizaci workoutu: ${res.status}`);
    return res.json();
  }
  
  
// Smaže workout podle ID.
   
export async function deleteWorkout(id) {
    const res = await fetch(`${API_BASE}/workouts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Chyba při mazání workoutu: ${res.status}`);
}
  
// Přidá nový cvik do workoutu.

export async function addExerciseToWorkout(workoutId, data) {
    const res = await fetch(`${API_BASE}/workouts/${workoutId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Chyba při přidávání cviku: ${res.status}`);
    return res.json();
}
  

// Aktualizuje cvik ve workoutu.

export async function updateExerciseInWorkout(workoutId, exerciseId, data) {
    const res = await fetch(
      `${API_BASE}/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
    if (!res.ok) throw new Error(`Chyba při úpravě cviku ve workoutu: ${res.status}`);
    return res.json();
}
  

// Smaže cvik z workoutu.
   
export async function deleteExerciseFromWorkout(workoutId, exerciseId) {
    const res = await fetch(
      `${API_BASE}/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'DELETE'
      }
    );
    if (!res.ok) throw new Error(`Chyba při mazání cviku z workoutu: ${res.status}`);
}
  

  // TODO: Přidat další API volání: createWorkout, updateWorkout, deleteWorkout,
  // addExerciseToWorkout, updateExerciseInWorkout, deleteExerciseFromWorkout