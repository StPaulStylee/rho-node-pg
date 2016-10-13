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
    client.query('SELECT * FROM books ORDER BY title', function(err, result){
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
  pool.connect(function(err, client, done){
    if (err) {
      console.log('Error connecting to the DB')
      res.sendStatus(500);
      done();
      return;
    }
    client.query('INSERT INTO books (author, title, published) VALUES ($1, $2, $3, $4, $5) returning*', [req.body.author, req.body.title, req.body.published, req.body.publisher, req.body.edition], function(err, result){
      done();
      if(err) {
        console.log('This is where the error is coming from')
        res.sendStatus(500);
        return;
      }
      res.send(result.rows);
    });
  });
});
// The : tells express that anything that follows shoud be placed into the params, and it should be treated as an id paramter.
// The params object represents any URL parameters that are part of the request.
// EX: PUT localhost:3000/books/42.... req.params.id === 42.
router.put('/:id', function(req, res){
  var id = req.params.id;
  var author = req.body.author;
  var title = req.body.title;
  var published = req.body.published;
pool.connect(function(err, client, done){
  if (err) {
    console.log('Error querying the database', err);
    res.sendStatus(500);
    done();
    return;
  }
  // I need clarification on what the returning * does.
  client.query('UPDATE books SET author=$1, title=$2, published=$3 WHERE id=$4 returning *;',
              [author, title, published, id],
              function(err, result) {
                if (err) {
                  console.log('Error querying the database', err);
                  res.sendStatus(500);
                  done();

                } else{
                res.send(result.rows);
                done();
                }
              });
            });
    });
// This is my best formatted db route
router.delete('/:id', function(req, res){
  var id = req.params.id;
  pool.connect(function(err, client, done){
    // I need clarificationon what the try/finally does.
    try{
      if (err) {
        console.log('Error connecting to DB', err);
        res.sendStatus(500);
        // This return can be removed and an else statement can replace it.... kinda like the query above.
        return;
      }
      //The function in the line below is the callback function. No returning * because users don't typically care.
      client.query('DELETE FROM books WHERE id=$1',[id], function(err){
        if (err) {
          console.log('Error querying the DB', err);
          res.sendStatus(500);
          return;
        }
        //Since we are just deletiing, we dont send back any results and hence there is no result in our callback function.
        res.sendStatus(204);
      });
    } finally {
      done();
    }
  });
});

module.exports = router;
