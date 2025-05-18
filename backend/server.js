//  import modulů

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

//  vytvoření express aplikace
const app = express();

//  middleware, parsování JSON a základní logování
app.use(cors({origin: 'http://localhost:3000' }));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

//  definice složek pro data
const DATA_ROOT = path.join(__dirname, 'data');
const WORKOUT_DIR = path.join(DATA_ROOT, 'workouts');
const EXERCISE_DIR = path.join(DATA_ROOT, 'exercises');

// validace ID
const ID_REGEX = /^\d+$/;

//  zjištění existence složek
async function ensureDataDirs() {
    for (const dir of [DATA_ROOT, WORKOUT_DIR, EXERCISE_DIR]) {
        try {
            await fs.mkdir(dir);
            console.log(`Vytvořena složka: ${dir}`);
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
    } 
}

//  funkce pro práci s JSON soubory
async function readJson(dir, id) {
    const file = path.join(dir, `${id}.json`);
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
}
async function writeJson(dir, id, data) {
    const file = path.join(dir, `${id}.json`);
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}
async function deleteFile(dir, id) {
    const file = path.join(dir, `${id}.json`);
    await fs.unlink(file);
}
async function listAll(dir) {
    const files = await fs.readdir(dir);
    const items = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const content = await fs.readFile(path.join(dir, file), 'utf8');
            items.push(JSON.parse(content));
        }
    }
    return items;
}

//Helper pro validaci vstupů
function isNonEmptyString(val, maxLen) {
    return typeof val === 'string' && val.trim() !== '' && val.length <= maxLen;
}

//Validace formátu datumu YYYY-MM_DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(dateStr) {
    const d = new Date(dateStr);
    return !isNaN(d) && d.toISOString().startsWith(dateStr);
}

//  Workout CRUD

//CREATE Workout
app.post('/workouts', async (req, res) => {
    try {
        const { název, datum, popis } = req.body;
        if(!isNonEmptyString(název, 30)) {
            return res.status(400).json({ message: 'Název je povinný a max 30 znaků' });
        }
        if(!datum) {
            return res.status(400).json({ message: 'Datum je povinné' });
        }
        if (!isValidDate(datum)) {
            return res.status(400).json({ message: 'Datum musí být ve formátu YYYY-MM-DD.' });
        }
        if (popis && (!isNonEmptyString(popis, 150))) {
            return res.status(400).json({ message: 'Popis max 150 znaků' });
        }
        const id = Date.now().toString();
        const record = { id, název, datum, popis: popis || '', workoutExercises: [] };
        await writeJson(WORKOUT_DIR, id, record);
        console.log(`Vytvořen workout ${id}`);
        res.status(201).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Chyba při vytvoření workoutu' });
    }
});

//READ workouts
app.get('/workouts', async (req, res) => {
    try {
        let workouts = await listAll(WORKOUT_DIR);
        const { from, to } = req.query;
        if (from && !isValidDate(from)) {
            return res.status(400).json({ message: 'Parameter from musí být ve formátu YYYY-MM-DD.' });
        }
        if (to && !isValidDate(to)) {
            return res.status(400).json({ message: 'Parameter to musí být ve formátu YYYY-MM-DD.' });
        }
        if (from) {
            workouts = workouts.filter(w => w.datum >= from);
        }
        if (to) {
            workouts = workouts.filter(w => w.datum <= to);
        }
        res.json(workouts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Chyba při načítání workoutů' });
    }
});

//READ one workout
app.get('/workouts/:id', async (req, res) => {
    try {
        const id = req.params.id;
    if (!ID_REGEX.test(id)) {
      return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
    }
        const workout = await readJson(WORKOUT_DIR, id);
        res.json(workout);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Workout nenalezen' });
    }
});

//UPDATE workout
app.put('/workouts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const { název, datum, popis } = req.body;
        if (název && !isNonEmptyString(název, 30)) {
            return res.status(400).json({ message: 'Název je povinný a max 30 znaků' });
        }
        if(!datum) {
            return res.status(400).json({ message: 'Datum je povinné' });
        }
        if (datum && !isValidDate(datum)) {
            return res.status(400).json({ message: 'Datum musí být ve formátu YYYY-MM-DD.'});
        }
        if (popis && !isNonEmptyString(popis, 150)) {
            return res.status(400).json({ message: 'Popis max 150 znaků' });
        }
        const original = await readJson(WORKOUT_DIR, id);
        const updated = {...original, ...req.body, id };
        await writeJson(WORKOUT_DIR, id, updated);
        console.log(`Upraven workout ${id}`);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Workout nenalezen'});
    }
});

// DELETE workout
app.delete('/workouts/:id', async (req, res) => {
    try {
        const id  = req.params.id;
        if (!ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        await deleteFile(WORKOUT_DIR, id);
        console.log(`Smazán workut ${id}`);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Workout nenalezen' });
    }
});

//  EXERCISES CRUD

// CREATE exercise
app.post('/exercises', async (req, res) => {
    try {
        const { název, muscleGroup } = req.body;
        if (!isNonEmptyString(název, 30) || !isNonEmptyString(muscleGroup, 30)) {
            return res.status(400).json({ message:'Název a muscleGroup jsou povinné, max 30 znaků'});
        }
        const id = Date.now().toString();
        const record = { id, název, muscleGroup };
        await writeJson(EXERCISE_DIR, id, record);
        console.log(`Vytvořen cvik ${id}`);
        res.status(201).json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Chyba při vytvoření cviku' });
    }
});

//READ all exercises
app.get('/exercises', async (req, res) => {
    try {
        const all = await listAll(EXERCISE_DIR);
        res.json(all);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Chyba při načítání cviků' });
    }
});

//READ one exercise
app.get('/exercises/:id', async (req, res) => {
    try {
        const id  = req.params.id;
        if (!ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const ex = await readJson(EXERCISE_DIR, id);
        res.json(ex);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Cvik nenalezen' });
    }
});

//UPDATE exercise
app.put('/exercises/:id', async (req, res) => {
    try {
        const id  = req.params.id;
        if (!ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const { název, muscleGroup } = req.body;
        if ((název && !isNonEmptyString(název, 30)) || (muscleGroup && !isNonEmptyString(muscleGroup, 30))) {
            return res.status(400).json({ message: 'Název a muscleGroup max 30 znaků'});
        }
        const original = await readJson(EXERCISE_DIR, id);
        const updated = {...original, ...req.body, id };
        await writeJson(EXERCISE_DIR, id, updated);
        console.log(`Upraven cvik ${id}`);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Cvik nenalezen'});
    }
});

// DELETE exercise
app.delete('/exercises/:id', async (req, res) => {
    try {
        const id  = req.params.id;
        if (!ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        await deleteFile(EXERCISE_DIR, id);
        console.log(`Smazán cvik ${id}`);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Cvik nenalezen' });
    }
});

//  Přiřazování cviku do workoutu

//Přidání cviku do workoutu
app.post('/workouts/:workoutId/exercises', async (req, res) => {
    try {
        const workoutId = req.params.workoutId;
        if (!ID_REGEX.test(workoutId)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const { exerciseId, sets, repetitions, weight } = req.body;
        const workout = await readJson(WORKOUT_DIR, workoutId);
        const exists = await fs.access(path.join(EXERCISE_DIR, `${exerciseId}.json`)).then(() => true).catch(() => false);
        if (!exists) return res.status(400).json({ message: 'Neplatný typ cviku'});
        if (!Number.isInteger(sets) || sets < 1 || sets > 50) {
            return res.status(400).json({ message: 'Sety musí být celé číslo 1-50.'});
        }
        if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 100) {
            return res.status(400).json({ message: 'Opakování musí být celé číslo 1-100.'});
        }
        if (typeof weight !== 'number' || weight < 0.1 || weight > 1000) {
            return res.status(400).json({ message: 'Váha musí být číslo 0.1-1000.'});
        }
        const linkId = Date.now().toString();
        const entry = { id: linkId, exerciseId, sets, repetitions, weight };
        workout.workoutExercises.push(entry);
        await writeJson(WORKOUT_DIR, workoutId, workout);
        console.log(`Přidán cvik ${exerciseId} do workoutu ${workoutId}`);
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Workout nenalezen' });
    }
});

//Get cviky ve workoutu
app.get('/workouts/:workoutId/exercises', async (req, res) => {
    try {
        const workoutId = req.params.workoutId;
        if (!ID_REGEX.test(workoutId)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const workout = await readJson(WORKOUT_DIR, workoutId);
        res.json(workout.workoutExercises);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Workout nenalezen' });
    }
});
//Úprava cviku ve workoutu
app.put('/workouts/:workoutId/exercises/:id', async (req, res) => {
    try {
        const workoutId = req.params.workoutId;
        const id = req.params.id;
        if (!ID_REGEX.test(workoutId) || !ID_REGEX.test(id)) {
            return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
        }
        const { sets, repetitions, weight } = req.body;
        const workout = await readJson(WORKOUT_DIR, workoutId);
        const idx = workout.workoutExercises.findIndex(e => e.id === id);
        if (idx === -1) throw new Error('Nenalezen');
        if (!Number.isInteger(sets) || sets < 1 || sets > 50) {
            return res.status(400).json({ message: 'Sety musí být celé číslo 1-50.'});
        }
        if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 100) {
            return res.status(400).json({ message: 'Opakování musí být celé číslo 1-100.'});
        }
        if (typeof weight !== 'number' || weight < 0.1 || weight > 1000) {
            return res.status(400).json({ message: 'Váha musí být číslo 0.1-1000.'});
        }
        workout.workoutExercises[idx] = { id, exerciseId: workout.workoutExercises[idx].exerciseId, sets, repetitions, weight};
        await writeJson(WORKOUT_DIR, workoutId, workout);
        console.log(`Upravný cvik ${id} ve workoutu ${workoutId}`);
        res.json(workout.workoutExercises[idx]);
    } catch (err) {
        console.error(err);
        res.status(404).json({ message: 'Cvik ve workoutu nenalezen' });
    }
});

//Smazání cviku z workoutu
app.delete('/workouts/:workoutId/exercises/:id', async (req, res) => {
    try {
      const workoutId = req.params.workoutId;
      const id = req.params.id;
      if (!ID_REGEX.test(workoutId) || !ID_REGEX.test(id)) {
        return res.status(400).json({ message: 'Neplatné ID. Pouze čísla jsou povolena.' });
      }
      const workout = await readJson(WORKOUT_DIR, workoutId);
      workout.workoutExercises = workout.workoutExercises.filter(e => e.id !== id);
      await writeJson(WORKOUT_DIR, workoutId, workout);
      console.log(`Smazán cvik ${id} z workoutu ${workoutId}`);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(404).json({ message: 'Cvik ve workoutu nenalezen' });
    }
  });

//Spuštění serveru
async function start() {
    await ensureDataDirs();
    const PORT = 3001;
    app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
}
start();