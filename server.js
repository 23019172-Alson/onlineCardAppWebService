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

//  ADDED: enable CORS so React Native can call your API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

//start the server 
app.listen(port, () => {
    console.log('Server is running on port', port);
});


//  Route: View all foods
app.get('/allfoods', async (req, res) => {
    try{
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.food');
        res.json(rows);
        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error for allfoods'});
    }
});

//  ADDED: alias endpoint so your week9demo app.js can fetch /allcards
// (re-uses your existing food table but returns in "card-like" fields)
app.get('/allcards', async (req, res) => {
  try {
    let connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM defaultdb.food');

    // Map food rows to fields your week9demo renderItem expects (card_name, card_pic)
    // card_pic is optional - RN Image needs a valid URL, so we provide a placeholder.
    const mapped = rows.map((r) => ({
      id: r.id,
      card_name: `${r.name} (${r.category}) - $${r.price}`,
      card_pic: 'https://via.placeholder.com/120x160.png?text=Food',
      // keep original fields too (useful if you later update RN app)
      name: r.name,
      category: r.category,
      price: r.price
    }));

    res.json(mapped);
    await connection.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for allcards (foods alias)' });
  }
});


//  Route: Add a new food
app.post('/addfood', async (req, res) => {
    const { name, category, price } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
          'INSERT INTO defaultdb.food (name, category, price) VALUES (?, ?, ?)',
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
        await connection.execute(
          'UPDATE defaultdb.food SET name=?, category=?, price=? WHERE id=?',
          [name, category, price, id]
        );

        res.json({message:'Food id ' + id + ' updated successfully'});
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
        await connection.execute(
          'DELETE FROM defaultdb.food WHERE id=?',
          [id]
        );

        res.json({message:'Food id ' + id + ' deleted successfully'});
        await connection.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not delete food id ' + id});
    }
});
