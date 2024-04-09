const express = require('express');
const app = express();


const {mongoose} = require('./db/mongoose');


const bodyParser = require('body-parser');

// Load in the mongoose models
const {List,Task,Day,User,Time} = require('./db/models');

/* MIDDLEWARE */


// Load middleware
app.use(bodyParser.json());
//CORS 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods","GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
 

  // Verify Refresh Token Middleware (which will be verifying the session)
  let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}


  /* END MIDDLEWARE */


/* Route Handlers*/
/* LIST Routes */
  /**
 * Get /lists
 * Purpose: Get all lists
 */
app.get('/lists', (req, res) => {
  let query = {};
  if (req.query.title) {
      query.title = req.query.title;
  }
  if (req.query.date) {
      query.Day = req.query.date;
  }
  if (req.query.listtitle) {
      query.listTitle = req.query.listtitle;
      Task.find(query)
          .then((tasks) => {
              res.send(tasks);
          })
          .catch((error) => {
              console.error("Error fetching tasks:", error);
              res.status(500).send("Error fetching tasks: " + error.message);
          });
  } else {
      List.find(query)
          .then((lists) => {
              res.send(lists);
          })
          .catch((error) => {
              console.error("Error fetching lists:", error);
              res.status(500).send("Error fetching lists: " + error.message);
          });
  }
});



/**
 * POST /Lists
 * Purpose: Create a list
 */
app.post('/lists', (req, res) => {
    // We want to create a new list or task and return the new document back to the user
    if (req.body.tasktitle) {
      let newTask = new Task({
        title: req.body.tasktitle,
        listTitle: req.body.listtitle,
        Day: req.body.date,
      });
      newTask.save().then((taskdoc) => {
        res.send(taskdoc);
      }).catch(error => {
        res.status(500).send("Error creating task: " + error.message);
      });
    } else {
      let newList = new List({
        title: req.body.title,
        Day: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime
      });
  
      newList.save().then((listDoc) => {
        res.send(listDoc);
      }).catch(error => {
        res.status(500).send("Error creating list: " + error.message);
      });
    }
  });

/**
 * PATH /lists
 * Purpose: Update a specified list
 */
app.patch('/lists', (req, res) => {
  // Construct query object based on query parameters in the request
  let query = {};
  if (req.body.taskTitle) {
      query.title = req.body.taskTitle;
  }
  if (req.body.listTitle) {
      query.listTitle = req.body.listTitle;
  }
  if (req.body.date) {
      query.Day = req.body.date;
  }

  // Update the specified list or task with the new values specified in the JSON body of the request
  let updateData = req.body;

  // Determine whether to update a task or a list based on the presence of 'listtitle' in the query
  let updatePromise;
  if (req.body.listTitle) {
      updatePromise = Task.findOneAndUpdate(query, updateData);
  } else {
      updatePromise = List.findOneAndUpdate(query, updateData);
  }

  updatePromise.then((result) => {
      if (result) {
          res.send({message : 'Updated Successfully'});
      } else {
        res.send({message : 'No matching record'});// Provide a more specific error message
      }
  }).catch((error) => {
      console.error("Error updating:", error);
      res.send({message : 'Error updating: ' +error.message});
  });
});

/**
 * Delete /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id',(req,res)=>{
  //We want to delete the specified list
  List.findOneAndDelete({
    _id: req.params.id
}).then((removedListDoc)=>{
    res.send(removedListDoc);
})
})
/**
 * Get /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */



/**
 * Get /list/:listId/tasks
 * Purpose: Create a new task
 */


/**
 * Patch /lists/:listId/tasks/:taskId
 * Purpose: Update an existing task  
 */


/**
 * Delete /lists/:listId/tasks/:taskId
 * Purpose: Delete an existing task
 */

app.delete('/lists/:listId/tasks/:taskId', (req, res)=>{
    //Delete an existing task by the specified id
    Task.findOneAndDelete({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((removedTaskDoc)=>{
        res.send(removedTaskDoc)
    })
})


/*USER ROUTES */

/**
 * POST /users
 * Purpose: Sign Up
 */
app.post('/users', (req, res) => {
  // User sign up

  let body = req.body;
  let newUser = new User(body);

  newUser.save().then(() => {
      return newUser.createSession();
  }).then((refreshToken) => {
      // Session created successfully - refreshToken returned.
      // now we geneate an access auth token for the user

      return newUser.generateAccessAuthToken().then((accessToken) => {
          // access auth token generated successfully, now we return an object containing the auth tokens
          return { accessToken, refreshToken }
      });
  }).then((authTokens) => {
      // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
      res
          .header('x-refresh-token', authTokens.refreshToken)
          .header('x-access-token', authTokens.accessToken)
          .send(newUser);
  }).catch((e) => {
      res.status(400).send(e);
  })
})


/**
* POST /users/login
* Purpose: Login
*/
app.post('/users/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password).then((user) => {
      return user.createSession().then((refreshToken) => {
          // Session created successfully - refreshToken returned.
          // now we geneate an access auth token for the user

          return user.generateAccessAuthToken().then((accessToken) => {
              // access auth token generated successfully, now we return an object containing the auth tokens
              return { accessToken, refreshToken }
          });
      }).then((authTokens) => {
          // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
          res
              .header('x-refresh-token', authTokens.refreshToken)
              .header('x-access-token', authTokens.accessToken)
              .send(user);
      })
  }).catch((e) => {
      res.status(400).send(e);
  });
})


/**
 * GET /usrs/me/access-token
 * Purpose: generates and returns an access token
 */

app.get('/users/me/access-token', verifySession, (req, res) => {
  // we know that the user/caller is authenticated and we have the user_id and user object available to us
  req.userObject.generateAccessAuthToken().then((accessToken) => {
      res.header('x-access-token', accessToken).send({ accessToken });
  }).catch((e) => {
      res.status(400).send(e);
  });
})

app.listen(3000,()=>{
    console.log("Server is listening to the port 3000");
})