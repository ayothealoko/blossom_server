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


// query ?word=1&sentence=5&paragraph=4
app.get('/v1/sentence/', (req, res) => {
    logger.info("GET /v1/sentence");
    const {word, sentence, paragraph} = req.query;
	console.log(req.query);
    // TODO handle error if querystring are sent
    pool.connect((err, client, release) => {
	if(err) {
	    return logger.error('Error acquiring client', err.stack);
	}
	let sql = `
SELECT translation FROM sentence_translation 
WHERE sentence_translation_id = 
(SELECT sentence_translation_id FROM word WHERE word_number=$1 AND sentence_number=$2 AND paragraph_number=$3);
`;

	client.query(sql,[word, sentence, paragraph], (err, result) =>{
	    release()
	    if(err) {
		return logger.error('Error executing query', err.stack)
	    }
	    logger.info("Successful connection to database")
	    const sentence = result.rows[0];
	    if (sentence){
		res.json(sentence);
	    } else {
		res.end();
	    }
	});
	})
});



// query ?word=1&sentence=5&paragraph=4
app.get('/v1/token/', (req, res) => {
    logger.info("GET /v1/token");
    const {word, sentence, paragraph} = req.query;
	console.log(req.query);
    // TODO handle error if querystring are sent
    pool.connect((err, client, release) => {
	if(err) {
	    return logger.error('Error acquiring client', err.stack);
	}
	let sql = `
SELECT translation, word_number, sentence_number, paragraph_number FROM token_translation t 
INNER JOIN word w ON w.token_translation_id = t.token_translation_id 
WHERE t.token_translation_id = 
(SELECT token_translation_id FROM word WHERE word_number=$1 AND sentence_number=$2 AND paragraph_number=$3);
`;

	client.query(sql,[word, sentence, paragraph], (err, result) =>{
	    release()
	    if(err) {
		return logger.error('Error executing query', err.stack)
	    }

	    logger.info("Successful connection to database");
	    const data = result.rows;
	    if (data && data[0] && data[0].translation){
		const translation = data[0].translation;
		const words = data.map((r) => {
		    return {
			wordNumber: r.word_number,
			sentenceNumber: r.sentence_number,
			paragraphNumber: r.paragraph_number,
		    }
		})
		res.json({
		    translation: translation,
		    words:words
		});
	    } else {
		res.end();
	    }
	});
	})
});

app.get('/v1/text', (req, res) => {
    logger.info("GET /v1/text");
    res.json(chapterData);
});

// 404 must be after other handlers
app.use(function (req, res, next) {
    res.sendStatus(404);
})

const port = process.env.PORT || 4000;

app.listen(port, () => logger.info(`server started at port:${port}`));
