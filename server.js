const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;   

//database config info 
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

//initialize express app
const app = express();
//helps app to read JSON
app.use(express.json());

//start the server 
app.listen(port, () => {
    console.log('Server is running on port', port);
});


//  Route: View all foods
app.get('/allfoods', async (req, res) => {
    try{
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.foods');
        res.json(rows);
        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error for allfoods'});
    }
});


//  Route: Add a new food
app.post('/addfood', async (req, res) => {
    const { name, category, price } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
          'INSERT INTO defaultdb.foods (name, category, price) VALUES (?, ?, ?)',
          [name, category, price]
        );

        res.status(201).json({message:'Food ' + name + ' added successfully'});
        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not add food ' + name});
    }
});


//  Route: Update a food (by id)
app.put('/updatefood/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, price } = req.body;

    try{
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
          'UPDATE defaultdb.foods SET name=?, category=?, price=? WHERE id=?',
          [name, category, price, id]
        );

        if (result.affectedRows === 0) {
          res.status(404).json({message:'Food id ' + id + ' not found'});
        } else {
          res.json({message:'Food id ' + id + ' updated successfully'});
        }

        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not update food id ' + id});
    }
});


//  Route: Delete a food (by id)
app.delete('/deletefood/:id', async (req, res) => {
    const { id } = req.params;

    try{
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
          'DELETE FROM defaultdb.foods WHERE id=?',
          [id]
        );

        if (result.affectedRows === 0) {
          res.status(404).json({message:'Food id ' + id + ' not found'});
        } else {
          res.json({message:'Food id ' + id + ' deleted successfully'});
        }

        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not delete food id ' + id});
    }
});
