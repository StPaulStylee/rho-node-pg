var router = require('express').Router();
var pg = require('pg');

// This is a JS object with a key with a value of database: and a property called rho. THis lets our server know
// connect with the datsbase we want to use.
var config = {
  database: 'rho',
};
// Initialize the database connection pool
var pool = new pg.Pool(config);

router.get('/:id', function(req, res){
  pool.connect(function(err, client, done){
    if (err) {
      console.log('Error connecting to the database', err);
      res.sendStatus(500);
      done();
      return;
    }
    client.query('SELECT * FROM books WHERE id = $1;',[req.params.id], function(err, result){
      if (err) {
        console.log('Error querying the database', err);
        res.sendStatus(500);
        done();
        return;
      }
      console.log('Got rows from the database: ', result.rows);
      res.send(result.rows);
    });
  });
});
// POST = CREATE    GET = READ    PUT = UPDATE    DELETE = DELETE
router.get('/', function(req, res){
  // err - an error object, will be not-null if there was an error connecting. Some possible errors occur
  // when the database isn't running or something is wrong with your configuration.
  // client - object that is used to make queries against the database.
  // done - fucnction to call when you're done (returns the connection back to the pool)
  pool.connect(function(err, client, done){
    if (err) {
      console.log('Error connectoing to the database', err);
      // Status 500 indicates a likely problem with the server, not the client
      res.sendStatus(500);
      done();
      // We use return here to stop the execution of the function. An else statement could also be used.
      return;
    }
    // Client query takes up to 3 parameters....
    // SQL string
    // (optional) input parameters
    // callback function -- takes an error object and a result object as arguments
    client.query('SELECT * FROM books', function(err, result){
      done();
      if (err) {
        console.log('Error querying the database', err);
        res.sendStatus(500);
        return;
      }
      console.log('Got rows from the database: ', result.rows);
      res.send(result.rows);
    });
  });
});

router.post('/', function (req, res){
  console.log('I got one!', req.body);
  pool.connect(function(err, client, done){
    if (err) {
      res.sendStatus(500);
      return;
    }
    client.query('INSERT INTO books (author, title, published) VALUES ($1, $2, $3, $4, $5) returning*', [req.body.author, req.body.title, req.body.published, req.body.publisher, req.body.edition], function(err, result){
      done();
      if(err) {
        res.sendStatus(500);
        return;
      }
      res.send(result.rows);
    });
  });
});

module.exports = router;
