module.exports = function(app, shopData) {

    const redirectLogin = (req, res, next) => { //redirect to login page when user is not logged in
        if (!req.session.userId ) {
        res.redirect('./login')
        } else { next (); }
        }
    
    
    const { check, validationResult } = require('express-validator');


    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });

    //about page 
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    //search page
    app.get('/search',redirectLogin,function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', 
    [check('name').isAlphanumeric( ['en-GB'], {'ignore': ' _-'})], //check if name contains only letters and numbers, ignoring space, '_' and '-'
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {res.redirect('./register'); } //if not redirect to the empty register page

        else{
        //searching in the database
        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.sanitize(req.query.keyword) + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
}});

    //log in page
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin', function (req,res) {
        const bcrypt = require('bcrypt');
        let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?"; // query database 
        let newrecord = [req.sanitize(req.body.username)];

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
    else if (result == true) {   //if the password is right 
        req.session.userId = req.body.username;
        res.send('Hi ' + req.sanitize(req.body.username) +':) Login successful!');
                                                                     
    }
    else { //if the password or username is incorrect
        res.send(' Login unsuccessful. Your username or password is incorrect. Try again:)');
    }
     });
   });
});

app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => { //log out user 
    if (err) {
    return res.redirect('./')
    }
    res.send('You are now logged out. See you soon <a href='+'./'+'>Back to Home Page</a>');
    })
    })
 
    //register page 
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', 
    [check('email').isEmail()],  //check if imput is correct email
    [check('username').isLength({min:3})], //check if length of username is at least 3
    [check('password').isLength({min: 8})], //check if length of password is at least 8
    [check('first').isAlpha()],  // check if first name contains only letters
    [check('last').isAlpha()],  //check if last name contains only letters
    function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {res.redirect('./register'); } //if one of above validation is incorrect redirect to empty register page
     else{
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { // Store hashed password in database.
        let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)"; //insert users to database
        let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first),
                         req.sanitize(req.body.last), req.sanitize(req.body.email), req.sanitize(hashedPassword)];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) { 
              return console.error(err.message);
            }
            else //if user correctly registered 
            result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email);
            result += ' Your password is: '+ req.sanitize(req.body.password) +' and your hashed password is: '+ req.sanitize(hashedPassword);
            res.send(result);
            });
        });
    
}}); 

    //list page
    app.get('/list', redirectLogin, function(req, res) {
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
    app.get('/listusers',redirectLogin, function(req, res) {
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
    app.get('/deleteuser', redirectLogin, function (req, res) {
        res.render('deleteuser.ejs', shopData);
     });

     app.post('/userdeleted', 
     [check('username').isLength({min:3})], //check if username length is at least 3
     function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {res.redirect('./delete'); } //if not redirect to empty delete page
        else{
        let sqlquery = "DELETE FROM users WHERE username =?"; // query database to delete user
        let newrecord = [req.sanitize(req.body.username)];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return console.error(err.message);
            }
            else  //if user has been correctly deleted 
            res.send('User: ' + req.sanitize(req.body.username) + ' has been deleted');
        })
        
}});

     //addbook page
    app.get('/addbook', redirectLogin, function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded',
     [check('price').isNumeric()], // check if price contains only a numbers
     [check('name').isAlphanumeric( ['en-GB'], {'ignore': ' _-'})], //check if name contains only letters and numbers, ignoring space, '_' and '-'
     function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {res.redirect('./addbook'); } //if something is incorrect redirect to empty addbook page
     else{

           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.sanitize(req.body.name), req.sanitize(req.body.price)];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else //when book is added
             res.send(' This book is added to database, name: '+ req.sanitize(req.body.name) +  ' price '+ req.sanitize(req.body.price));
             });
}});    

       //bargain books page
       app.get('/bargainbooks',redirectLogin, function(req, res) {
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