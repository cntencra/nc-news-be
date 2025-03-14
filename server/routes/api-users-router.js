const apiUsersRouter = require("express").Router();

const {
    getUsers,
    getUser
} = require("../controllers/users.controllers.js");

apiUsersRouter.get(``, getUsers);

apiUsersRouter.get(`/:username`, getUser);

module.exports = apiUsersRouter;