const express = require('express');
const { Pool } = require('pg');
require('dotenv').config()

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString
});

pool.connect(err => {
    if (err) {
        console.log('Error connecting to the database');
    } else {
        console.log('Connected to the database');
    }
});

app.get('/api/health', (req, res) => {
    res.send('It is alive!')
});

app.get('/api/users', (req, res) => {
    pool.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.log('Error querying the database');
            res.status(500).send('Error querying the database');
        } else {
            res.status(200).send(result.rows);
        }
    });
});

app.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            console.log('Error querying the database');
            res.status(500).send('Error querying the database');
        } else {
            res.status(200).send(result.rows);
        }
    });
});


app.post('/api/users', async (req, res) => {
    const { name, location } = req.body;

    if (!name || !location) {
        return res.status(400).send('Name and location are required');
    }

    try {
        const result = await pool.query('INSERT INTO users (name, location) VALUES ($1, $2) RETURNING *', [name, location]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.put('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const { name, location } = req.body;

    if (!name || !location) {
        return res.status(400).send('Name and location are required');
    }

    try {
        const result = await pool.query('UPDATE users SET name = $1, location = $2 WHERE id = $3 RETURNING *', [name, location, id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

