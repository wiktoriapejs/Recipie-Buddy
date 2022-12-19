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

    //log in page
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin',
            [check("username").not().isEmpty(), //check if username is not empty
            check("password").not().isEmpty()], //check if password is not empty
     function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {res.redirect('./login'); } //if one of above validation is incorrect redirect to empty login page
     else{
        const bcrypt = require('bcrypt'); //imports bcrypt as an object
        let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?"; // query database to find hashed password for username from the input
        let newrecord = [req.sanitize(req.body.username)];
        let hashedPassword;
        db.query(sqlquery,newrecord, (err,result) => {
            if(err)
            {
                return console.error(err.message); //if error throw error
            }
            else if(!result.length) //if username or password is incorrect throw message
        {
           
            res.send(' Login unsuccessful. Your username or password is incorrect. Try again:) <a href='+'./'+'>Back to Home Page</a>');

        }
            else hashedPassword = result[0].hashedPassword;  //if everything is correct user can log in 


    // Compare the password supplied with the password in the database
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
    if (err) {
        return console.error(err.message); //if error throw error
    }
    else if (result == true) {   //if the password is right 
        req.session.userId = req.body.username;
        res.send('Hi ' + req.sanitize(req.body.username) +':) Login successful! <a href='+'./'+'>Back to Home Page</a>');
                                                                     
    }
    else { //if the password or username is incorrect
        res.send(' Login unsuccessful. Your username or password is incorrect. Try again:) <a href='+'./'+'>Back to Home Page</a>');
    }
     });
   });
}
});

app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => { //log out user 
    if (err) {
    return res.redirect('./') //if error redirect to main page
    }
    //after user is logged out display message and redirect to main page
    res.send('You are now logged out. See you soon <a href='+'./'+'>Back to Home Page</a>');
    })
    })
 
    //register page 
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    }); 

    app.post('/registered', 
    [check('email').isEmail(),  //check if imput is correct email
    check('username').isLength({min:3}), //check if length of username is at least 3
    check('password').isLength({min: 8}), //check if length of password is at least 8
    check('first').isAlpha(),  // check if first name contains only letters
    check('last').isAlpha()],  //check if last name contains only letters
    function (req,res) {
        const errors = validationResult(req); //errors from the validation
        if (!errors.isEmpty()) {res.redirect('./register'); } //if one of above validation is incorrect redirect to empty register page
     else{
        const bcrypt = require('bcrypt'); //importing bcrypt object
        const saltRounds = 10; //for spicing up hashing
        const plainPassword = req.body.password;
        
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { // Store hashed password in database.
        let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)"; //insert users to database
        //store imputs into account object
        let newrecord = [req.sanitize(req.body.username), //saintize the inputs
                        req.sanitize(req.body.first),
                         req.sanitize(req.body.last), 
                         req.sanitize(req.body.email),
                        req.sanitize(hashedPassword)];
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) { 
              return console.error(err.message); //if error throw error
            }
            else{ //if user correctly registered 
            result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email);
            result += ' Your password is: '+ req.sanitize(req.body.password) +' and your hashed password is: '+ req.sanitize(hashedPassword) + '<a href='+'./'+'> Back to Home Page</a>';
            res.send(result);}
            });
        });
    
}}); 

     //addbook page
     app.get('/addfood', redirectLogin, function (req, res) {
        res.render('addfood.ejs', shopData);
     });

app.post('/foodadded',
        //checking if user input is not empty and checking if relevant data is added for example: number for carbs and letters for name.
        [check("name").not().isEmpty().isAlpha()],
        [check("value").not().isEmpty().isFloat()],
        [check("unit").not().isEmpty()],
        [check("carbs").not().isEmpty().isFloat()],
        [check("fat").not().isEmpty().isFloat()],
        [check("protein").not().isEmpty().isFloat()],
        [check("salt").not().isEmpty().isFloat()],
        [check("sugar").not().isEmpty().isFloat()] , 
     function (req,res) {
        const errors = validationResult(req); //error from validation
        if (!errors.isEmpty()) {res.redirect('./addfood'); } //if something is incorrect redirect to empty addbook page
     else{
           // saving data in database
           let sqlquery = "INSERT INTO food (name, value, unit, carbs, fat, protein, salt, sugar, author) VALUES (?,?,?,?,?,?,?,?,?)" ;
           // execute sql query 
           //sanitize the inputs
           let newrecord = [req.sanitize(req.body.name), 
                            req.sanitize(req.body.value), 
                            req.sanitize(req.body.unit), 
                            req.sanitize(req.body.carbs),
                            req.sanitize(req.body.fat), 
                            req.sanitize(req.body.protein), 
                            req.sanitize(req.body.salt), 
                            req.sanitize(req.body.sugar), 
                            req.session.userId];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message); //if error throw error
             }
             else //when book is added
             res.send(' This food item is added to database, name: '+ req.sanitize(req.body.name) + '<a href='+'./'+'> Back to Home Page</a>');
             });
}});   

  //search page
  app.get('/search',redirectLogin,function(req,res){
    res.render("search.ejs", shopData);
});
app.get('/search-result', 
        [check("keyword").not().isEmpty().isAlpha()], //chcecking if keyword is not empty and contains only letters                       
        function (req,res) {
        const errors = validationResult(req); //error from validation
        if (!errors.isEmpty()) {res.redirect('./search'); } //if something is incorrect redirect to empty addbook page
    else{

    let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + req.sanitize(req.query.keyword) + "%'"; // query database to get all the foods
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect('./'); //if error redirect to main page
        }
        else{
            let newData = Object.assign({}, shopData, {availableFood:result});
            console.log(newData);
            if(result.length==0){ //if no food like this in database throw message 
                res.send( "Could not find any results for "+req.sanitize(req.query.keyword) + '<a href='+'./search'+'> Try again:)</a>');
            }else{
                res.render("list.ejs", newData) //if the word is correct send list
            }
    }
     });   
    }     
});

 //list page
 app.get('/list', redirectLogin, function(req, res) {
    let sqlquery = "SELECT * FROM food"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect('./'); //if error redirect to main page
        }
        let newData = Object.assign({}, shopData, {availableFood:result});
        console.log(newData)
        res.render("list.ejs", newData) //if no error show the list
     });
});

  //search food for update page
  app.get('/searchupdate',redirectLogin,function(req,res){
    res.render("searchupdate.ejs", shopData);
});

//search food for update result page
app.get('/searchupdate-result', [check("keyword").not().isEmpty().isAlpha()], //checking if keyword is not empty and it contains only letters   
         function (req,res) {
            const errors = validationResult(req); //error from validation
            if (!errors.isEmpty()) {res.redirect('./searchupdate'); } //if something is incorrect redirect to empty addbook page
    else{
    let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + req.sanitize(req.query.keyword) + "%'"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            res.redirect('./'); //if error redirect to main page
        }
        else{
            let newData = Object.assign({}, shopData, {availableFood:result});
            console.log(newData);
            if(result.length==0){ //if no object like this in database
                res.send( "Could not find any results for "+req.sanitize(req.query.keyword) + '<a href='+'./searchupdate'+'> Try again:)</a>');
            }else{
                res.render("updatefood.ejs", newData)  //if object is correct show updatefood.ejs
              }
    
        
}});
    }        
});


  //update food page
  app.get('/updatefood',function(req,res){
    res.render("updatefood.ejs", shopData);
});
    
    //food updated page
    app.post('/foodupdated',
            //checking if user input is not empty and checking if relevant data is added for example: numbers for carbs and letters for name etc.
            [check("name").not().isEmpty().isAlpha()],
            [check("value").not().isEmpty().isFloat()],
            [check("unit").not().isEmpty()],
            [check("carbs").not().isEmpty().isFloat()],
            [check("fat").not().isEmpty().isFloat()],
            [check("protein").not().isEmpty().isFloat()],
            [check("salt").not().isEmpty().isFloat()],
            [check("sugar").not().isEmpty().isFloat()] ,  
        function (req,res) {
            const errors = validationResult(req); //error from validation
            if (!errors.isEmpty()) {res.redirect('./searchupdate.ejs'); } //if something is incorrect redirect to empty addbook page
         else{
            //searching author for the name from the input
        let sqlquery1 ="SELECT author FROM food WHERE name=?";
        let newrecord1 =req.sanitize(req.body.name);
        db.query(sqlquery1, newrecord1,(err, result) => {
            if (err) {
              return console.error(err.message); //if error throw error
            }
            else 
            {
                let author = result[0].author; //show only author
                console.log(author);
                if(req.session.userId==author){ //chceking if username is author
                    // saving data in database
                    let sqlquery = "UPDATE food SET value=?, unit=?, carbs=?, fat=?, protein=?, salt=?, sugar=? WHERE name = ? " 
                    // execute sql query and sanitize input
                    let newrecord = [req.sanitize(req.body.value),
                                     req.sanitize(req.body.unit), 
                                     req.sanitize(req.body.carbs), 
                                     req.sanitize(req.body.fat), 
                                     req.sanitize(req.body.protein), 
                                     req.sanitize(req.body.salt), 
                                     req.sanitize(req.body.sugar),
                                     req.sanitize(req.body.name)];
                    db.query(sqlquery, newrecord,(err, result) => {
                      if (err) {
                        return console.error(err.message); //if error throw error
                      }
                      else //when food is updated
                      res.send(' This food item: ' + req.sanitize(req.body.name) +' is updated! ' + '<a href='+'./'+'> Back to Home Page</a>');
                      });
                     }
                     else{ //if username is not the author
                         res.send(' Sorry. Only the author can update:(' + '<a href='+'./'+'> Back to Home Page</a>');
                     }
            }
        
        });
    }
});  

//food deleted
app.post('/deletefood',function (req,res) {

    let sqlquery1 ="SELECT author FROM food WHERE name=?" //select author for the name from the input
    let newrecord1 =req.sanitize(req.body.name);
    db.query(sqlquery1, newrecord1,(err, result) => {
        if (err) {
          return console.error(err.message); //if error throw error
        }
        else 
        {
            let author = result[0].author; //show only author 
            console.log(author);
            if(req.session.userId==author){ //checking if username who wants to delete is author
                // saving data in database
                let sqlquery = "DELETE FROM food WHERE name=?" ;
                // execute sql query
                let newrecord = [req.sanitize(req.body.name)]      
                db.query(sqlquery, newrecord,(err, result) => {
                    if (err) {
                    return console.error(err.message); //if error throw error
                    }
                    else  //if username is author
                    res.send('Food item: ' + req.sanitize(req.body.name) + ' has been deleted <a href='+'./'+'>Back to Home Page</a>');
                });
                 }
                 else{ //if username is not author
                     res.send(' Sorry. Only the author can delete:(' + '<a href='+'./'+'> Back to Home Page</a>');
                 }
        }
    }); 
});  

    //list food page
    app.get('/listfood', function(req, res) {
        let sqlquery = "SELECT * FROM food"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');  //if error redirect to main page
            }
            let newData = Object.assign({}, shopData, {food:result});
            console.log(newData)
            res.render("listfood.ejs", newData) //if no error show listfood.ejs and display newData
         });
    });




    /////////////////  API ////////////////

   // get all food 
    app.get('/api', function (req,res) {
        let sqlquery = "SELECT * FROM food";  // Query database to get all the food
                db.query(sqlquery, (err, result) => {
                    if (err) {
                        res.redirect('./');  //if error redirect to maing page
                    }
                    res.json(result); //if no error show result 
          
                });
        }); 

        // get food with the exact same id provided
        app.get('/api/id/:id', function (req,res) {
            let newrecord =[req.sanitize(req.params.id)]
            let sqlquery = "SELECT * FROM food Where id=?";  // Query database to get all information about id from the input
        // Execute the sql query
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        res.redirect('./');  //if error redirect to maing page
                    }
                    res.json(result);  //if no error show result 
          
                });
            }); 
            // get food with the exact same name provided, may list food with the same name
        app.get('/api/name/:name', function (req,res) {
                let newrecord =[req.sanitize(req.params.name)]
                let sqlquery = "SELECT * FROM food Where name=?";  // Query database to get all the books 
            // Execute the sql query
                    db.query(sqlquery, newrecord, (err, result) => {
                        if (err) {
                            res.redirect('./');  //if error redirect to maing page
                        }
                        res.json(result);  //if no error show result
              
                    });
                }); 
        // get food with the exact same author provided, may list all food items with the same author
         app.get('/api/author/:author', function (req,res) {
                let newrecord =[req.sanitize(req.params.author)]
                let sqlquery = "SELECT * FROM food Where author=?";  // Query database to get all the books 
            // Execute the sql query
                    db.query(sqlquery, newrecord, (err, result) => {
                        if (err) {
                            res.redirect('./');  //redirect to maing page
                        }
                        res.json(result);  //if no error show result
              
                    });
                }); 
        
        //insert food item        
        app.post('/api/post',  function (req,res) {   
           let sqlquery = "INSERT INTO food (name, value, unit, carbs, fat, protein, salt, sugar) VALUES (?,?,?,?,?,?,?,?)" ;
           // execute sql query and sanitize 
           let newrecord = [req.sanitize(req.body.name),
                            req.sanitize(req.body.value), 
                            req.sanitize(req.body.unit), 
                            req.sanitize(req.body.carbs),
                            req.sanitize(req.body.fat),
                            req.sanitize(req.body.protein), 
                            req.sanitize(req.body.salt), 
                            req.sanitize(req.body.sugar)];
           console.log(newrecord);
           db.query( sqlquery, newrecord,  (err, result) => {
             if (err) {
               return console.error(err.message); //if error show error
             }
             else //when food item is added
             res.json(' This food item is added to database, name: '+ req.sanitize(req.body.name));
            });   
})
        //delete food item
        app.delete('/api/id/:id', function (req,res){
            let newrecord =[req.sanitize(req.params.id)]
            // saving data in database
            let sqlquery = "DELETE FROM food WHERE id=?" ; //delete food where id is input
            // execute sql query      
            db.query(sqlquery, newrecord,(err, result) => {
            if (err) {
            return console.error(err.message); //if error throw error
            }
            else  //if no error show confirmation message
            res.send('Food item has been deleted' )
        })
    })

        //update food
        app.patch('/api/id/:id', function (req,res){
           // saving data in database //coalesce 
           let sqlquery = "UPDATE food SET value=COALESCE(?,NULL,value), unit=COALESCE(?,NULL,unit), carbs=COALESCE(?,NULL,carbs), fat=COALESCE(?,NULL,fat), protein=COALESCE(?,NULL,protein), salt=COALESCE(?,NULL,protein), sugar=COALESCE(?,NULL,protein) WHERE id = ? " 
           // execute sql query and sanitize
           let newrecord = [req.sanitize(req.body.value),
                            req.sanitize(req.body.unit),
                            req.sanitize(req.body.carbs), 
                            req.sanitize(req.body.fat), 
                            req.sanitize(req.body.protein), 
                            req.sanitize(req.body.salt), 
                            req.sanitize(req.body.sugar),
                            req.sanitize(req.params.id)];

           db.query(sqlquery,newrecord,(err, result) => {
             if (err) {
               return console.error(err.message); //if error throw error
             }
             else {//if no error when food is updated 
             res.json(' This food item is updated! ');
             }
             });

 })



  

}