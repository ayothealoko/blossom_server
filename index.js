require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const pg = require("pg");
const logger = require("./logger");

const app = express();
const { Pool } = require('pg');

const pool = new Pool();

// TODO CHANGE THIS TO HANDLE MORE TEXT
const chapterData = require("./text.json");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// GET /v1/word_translation/
// query ?word=1,chapter=2
app.get('/v1/word_translation/', (req, res) => {
    logger.info("GET /v1/word_translation/");

    const {word, chapter} = req.query;
    
    pool.connect((err, client, release) => {
  	let sql= `
SELECT translation FROM word_translation
Where word_translation_id= (SELECT word_translation_id FROM word WHERE chapter_id = $2 AND word_number = $1);
             `;

	client.query(sql,[word, chapter], (err, result) =>{
  	    release()

	    if(err) {
		console.log(err)
  		return logger.error('Error executing query', err.stack)
  	    }

  	    logger.info("Successful connection to database");
  	    const data = result.rows;

	    if (data && data[0] && data[0].translation){
  		const translation = data[0].translation;

		res.json(
		    {
			word_translation: translation,
		  }
		)
	    }

	    res.end();
	});
})});

// get?word=1,chapter=2
app.get('/v1/sentence_translation/', (req, res) => {
    logger.info("GET /v1/word_translation/");

    const {word, chapter} = req.query;
    
    pool.connect((err, client, release) => {
  	let sql= `
SELECT translation FROM sentence_translation
Where sentence_translation_id= (SELECT sentence_translation_id FROM word WHERE chapter_id = $2 AND word_number = $1);
             `;

	client.query(sql,[word, chapter], (err, result) =>{
  	    release()

	    if(err) {
  		return logger.error('Error executing query', err.stack)
  	    }

  	    logger.info("Successful connection to database");
  	    const data = result.rows;

	    if (data && data[0] && data[0].translation){
  		const translation = data[0].translation;

		res.json(
		    {
			sentence_translation: translation,
		  }
		)
	    }

	    res.end();
	});
})});

// get?chapter=1
app.get('/v1/chapter_info/', (req, res) => {
    logger.info("GET /v1/chapter_info/");

    const {chapter} = req.query;
    
    pool.connect((err, client, release) => {
  	let sql= `
SELECT chapter_number, location, chapter_name, subtitle_location, audio_location  FROM chapter
WHERE chapter_id = $1;
             `;

	client.query(sql,[chapter], (err, result) =>{
  	    release()

	    if(err) {
  		return logger.error('Error executing query', err.stack)
  	    }

  	    logger.info("Successful connection to database");
  	    const data = result.rows;

	    if (data && data[0]){
  		const chapter_number = data[0].chapter_number;
  		const location = data[0].location;
  		const chapter_name = data[0].chapter_name;
  		const subtitle_location = data[0].subtitle_location;
  		const audio_location = data[0].audio_location;

		res.json(
		    {
			chapter_number: chapter_number,
			location: location,
			chapter_name: chapter_name,
			subtitle_location: subtitle_location,
			audio_location: audio_location
		  }
		)
	    }

	    res.end();
	});
})});

// get?title=1
app.get('/v1/title_info/', (req, res) => {
    logger.info("GET /v1/title_info/");

    const {title} = req.query;
    
    pool.connect((err, client, release) => {
  	let sql= `
SELECT title_name FROM title
WHERE title_id = $1;
             `;

	client.query(sql,[title], (err, result) =>{
  	    release()

	    if(err) {
  		return logger.error('Error executing query', err.stack)
  	    }

  	    logger.info("Successful connection to database");
  	    const data = result.rows;

	    if (data && data[0]){
  		const title_name = data[0].title_name;

		res.json(
		    {
			title_name: title_name,
		  }
		)
	    }

	    res.end();
	});
})});



// 404 must be after other handlers
app.use(function (req, res, next) {
    console.log("yeah");
    res.sendStatus(404);
})

const port = process.env.PORT || 4000;

app.listen(port, () => logger.info(`server started at port:${port}`));
