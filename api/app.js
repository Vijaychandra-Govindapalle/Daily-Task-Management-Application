const express = require('express');
const app = express();


const {mongoose} = require('./db/mongoose');


const bodyParser = require('body-parser');

// Load in the mongoose models
const {List,Task,Day,User,Time} = require('./db/models');

const jwt = require('jsonwebtoken')

/* MIDDLEWARE */


// Load middleware
app.use(bodyParser.json());
//CORS 


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token',
        
    )
    next();
  });

  // check whether the request has a valid JWT access Token 
  let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
       if (err) {
        // there was an error
        // jwt is invalid - * DO NOT AUTHENTICATE *
        res.status(401).send(err);

       }else {
        //jwt is valid
        req.user_id = decoded._id;
        next();
       }
    })
  }
 

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
app.get('/lists', authenticate, (req, res) => {
    //  We want to return an array of all the lists that belong to the authenticated user
  let query = {};
  if (req.query.title) {
      query.title = req.query.title;
  }
  if (req.query.date) {
      query.Day = req.query.date;
  }
  query._userId = req.user_id
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
app.post('/lists',authenticate, (req, res) => {
    // We want to create a new list or task and return the new document back to the user

    
    if (req.body.tasktitle) {
        List.findOne({
            title: req.body.listtitle,
            _userId: req.user_id
        }).then((list) => {
            if (list) {
                return true;
            }
            return false

        }).then((canCreateTasks) => {
            if(canCreateTasks){
                // list object is valid
                // therefore the currently authenticated user can create new tasks
                let newTask = new Task({
                    title: req.body.tasktitle,
                    listTitle: req.body.listtitle,
                    Day: req.body.date,
                    _userId: req.user_id,
                });
                newTask.save().then((taskdoc) => {
                    res.send(taskdoc);
                }).catch(error => {
                    res.status(500).send("Error creating task: " + error.message);
                });
            } else {
                
                res.sendStatus(404);
            }

        })  
                
               
    } else {
        // Code for creating a new list
        let newList = new List({
            title: req.body.title,
            _userId: req.user_id,
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
app.patch('/lists', authenticate, (req, res) => {
    // Construct query object based on query parameters in the request
    let query = {};
    if (req.body.taskTitle) {
        query.title = req.body.tasktitle;
    }
    if (req.body.listTitle) {
        query.listTitle = req.body.listtitle;
    }
    if (req.body.date) {
        query.Day = req.body.date;
    }

    // Update the specified list or task with the new values specified in the JSON body of the request
    let updateData = req.body;

    // Determine whether to update a task or a list based on the presence of 'listtitle' in the query
    if (req.body.listtitle) {
        List.findOne({
            listTitle: req.body.listtitle,
            _userId: req.user_id
        }).then((list) => {
            if (list) {
                return true
            }
            return false
        }).then((canUpdateTasks) => {
            if(canUpdateTasks){
                Task.findOneAndUpdate(query, updateData)
                .then((result) => {
                    if (result) {
                        res.send({ message: 'Updated Successfully' });
                    } else {
                        res.send({ message: 'No matching record' }); // Provide a more specific error message
                    }
                })
                .catch((error) => {
                    console.error("Error updating:", error);
                    res.send({ message: 'Error updating: ' + error.message });
                });

            }
              
        
                // list object is valid
                // therefore the currently authenticated user can update tasks
               
             else {
                res.send({ message: 'Unauthorized' }); // User does not have permission to update tasks
            }
        });
    } else {
        query._userId = req.user_id;
        List.findOneAndUpdate(query, updateData)
            .then((result) => {
                if (result) {
                    res.send({ message: 'Updated Successfully' });
                } else {
                    res.send({ message: 'No matching record' }); // Provide a more specific error message
                }
            })
            .catch((error) => {
                console.error("Error updating:", error);
                res.send({ message: 'Error updating: ' + error.message });
            });
    }
});


/**
 * Delete /lists/:id
 * Purpose: Delete a list
 */
/*app.delete('/lists',(req,res)=>{
  //We want to delete the specified list
  List.findOneAndDelete({
    title: req.params.listTitle
}).then((removedListDoc)=>{
    res.send(removedListDoc);

    // delete all the tasks that are in the deleted list
    deleteTasksFromList(removedListDoc.title)
})
})*/

app.delete('/lists', authenticate, (req, res) => {
    // We want to delete the specified list or task
    
    // Construct the query object based on the request body
    let query = {};
    
        query.title = req.query.listtitle;
   
    
    query._userId = req.user_id; // Ensure that only the authenticated user's lists/tasks are deleted

    // Check if it's a task deletion or a list deletion
  /*  if (req.query.listtitle) {
        // Delete task
        List.findOne({
            listTitle: req.query.listtitle,
            _userId: req.user_id
        }).then((list) => {
            if (list) {
                // list object is valid
                // therefore the currently authenticated user can update tasks
                return true
            }
            return false
        }).then((canDeleteTasks) => {
            if(canDeleteTasks){
                Task.findOneAndDelete(query)
                .then((removedTaskDoc) => {
                    if (removedTaskDoc) {
                        res.send(removedTaskDoc);
                    } else {
                        res.status(404).send("Task not found");
                    }
                })
                .catch((error) => {
                    console.error("Error deleting task:", error);
                    res.status(500).send("Error deleting task: " + error.message);
                });

            }

        
               
             else {
                res.send({ message: 'Unauthorized' }); // User does not have permission to update tasks
            }
        })
    } else {*/
        // Delete list
        List.findOneAndDelete(query)
        .then((removedListDoc) => {
            if (removedListDoc) {
                // Delete all the tasks that are in the deleted list
                deleteTasksFromList(req.query.listtitle).then(() => {
                    res.send(removedListDoc);
                }).catch((error) => {
                    console.error("Error deleting tasks from list:", error);
                    res.status(500).send("Error deleting tasks from list: " + error.message);
                });
            } else {
                res.status(404).send("List not found");
            
        }})
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

/*Helper Methods */
let deleteTasksFromList = (listTitle) => {
    Task.deleteMany({
       listTitle
    }).then(() => {
        console.log("Tasks  were deleted!")
    })
}

app.listen(3000,()=>{
    console.log("Server is listening to the port 3000");
})