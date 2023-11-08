const express = require('express');
const pg = require('pg');
const client = new pg.Client('postgress://localhost/demo_db')
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json())
//console.log(express.json().toString())

app.get('/api/pokemon', async(req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM pokemon
        `;
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
      next(error)  
    }
});

app.get('/api/pokemon/:id', async(req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM pokemon WHERE id=$1;
        `;
        const response = await client.query(SQL, [req.params.id]);
        if(response.rows.length === 0){
            throw new Error('ID does not exist')
        }
        res.send(response.rows[0])
    } catch (error) {
        next(error)  
    }
});

app.delete('/api/pokemon/:id', async (req,res,next) => {
try {
    const SQL =`
    DELETE FROM pokemon WHERE id=$1;
    `;
    const response = await client.query(SQL, [req.params.id])
    res.send(response.rows)
} catch (error) {
    next(error)
}
});

app.post('/api/pokemon', async (req, res, next) => {
    const body = req.body
    console.log(body)
try {
    const SQL = `
        INSERT INTO pokemon(name, type, generation)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const response = await client.query(SQL, [req.body.name, req.body.type, req.body.generation])
    res.send(response.rows)
} catch (error) {
    next(error)
}
});

app.put('/api/pokemon/:id', async (req, res,next) => {
    try {
        const SQL = `
            UPDATE pokemon
            SET name = $1, type = $2, generation = $3
            WHERE id = $4
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.generation, req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.use('*', (req,res,next) => {
    res.status(404).send('Invalid Route')
});

app.use((err, req, res, next) => {
    console.log('error handler')
    res.status(500).send(err.message)
});

const start = async() => {
    await client.connect()
    console.log('connect to db')
    const SQL = `
        DROP TABLE IF EXISTS pokemon;
        CREATE TABLE pokemon(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            type VARCHAR(100),
            generation INT
        );
        INSERT INTO pokemon (name, type, generation) VALUES ('pikachu', 'electric', 1);
        INSERT INTO pokemon (name, type, generation) VALUES ('charizard', 'fire', 1);
        INSERT INTO pokemon (name, type, generation) VALUES ('mewtwo', 'psychic', 1);
        INSERT INTO pokemon (name, type, generation) VALUES ('snorlax', 'normal', 2);
        INSERT INTO pokemon (name, type, generation) VALUES ('cubone', 'normal', 2);
    `;

    await client.query(SQL)
    console.log('table seeded')
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}`)
    })
};

start();