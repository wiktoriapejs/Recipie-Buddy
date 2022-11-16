module.exports = function(app, shopData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });

    //about page 
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    //search page
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });

    //log in page
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin', function (req,res) {
        const bcrypt = require('bcrypt');
        let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?"; // query database 
        let newrecord = [req.body.username];
        let hashedPassword;
        db.query(sqlquery,newrecord, (err,result) => {
            if(err)
            {
                return console.error(err.message);
            }
            else if(!result.length)
        {
            res.send(' Login unsuccessful. Your username or password is incorrect. Try again:)');

        }
            else hashedPassword = result[0].hashedPassword;


    // Compare the password supplied with the password in the database
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
    if (err) {
        return console.error(err.message);
    }
    else if (result == true) {  
        res.send('Hi ' + req.body.username +':) Login successful!');
                                                                     
    }
    else {
        res.send(' Login unsuccessful. Your username or password is incorrect. Try again:)');
    }
     });
   });
});
 
    //register page 
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', function (req,res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { // Store hashed password in database.
        let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)"; //insert users to database
        let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
              return console.error(err.message);
            }
            else
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! We will send an email to you at ' + req.body.email;
            result += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            res.send(result);
            });
        });
    
    }); 

    //list page
    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    //list users page
    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT * FROM users"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {users:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    //delete user page
    app.get('/deleteuser', function (req, res) {
        res.render('deleteuser.ejs', shopData);
     });

     app.post('/userdeleted', function (req, res) {
        let sqlquery = "DELETE FROM users WHERE username =?"; // query database to delete user
        let newrecord = [req.body.username];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else 
            res.send('User: ' + req.body.username + ' has been deleted');
        })
        
     });

     //addbook page
    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
       });    

       //bargain books page
       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20"; //uery database to get all books where price is less than 20
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });       

}