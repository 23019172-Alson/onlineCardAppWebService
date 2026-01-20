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

// Example Route: Get all Cards
app.get('/allcards', async (req, res) => {
    try{
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error for allcards'});
    }
});

// Example Route: Create a new Card
app.post('/addcard', async (req, res) => {
    const { card_name,card_pic } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO defaultdb.cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic]);

        res.status(201).json({message:'Card'+card_name+' added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not add card '+card_name});
        
        
    }
});

// Example Route: Delete a Card 
app.delete('/deletecard/:id', async (req, res) => {
    const {id}= req.params;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id ='+ id);
        res.status(201).json({message:'Card '+ id+ 'deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not delete card '+ id});

    }
});


// Example Route: Update a Card
app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?', [card_name, card_pic, id]);
        res.status(201).json({message:'Card '+ card_name+ 'updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not update card '+ card_name});
    }
});