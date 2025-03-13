const apiUsersRouter = require("express").Router();

const {
    getUsers
} = require("../controllers/users.controllers.js");

apiUsersRouter.get(``, getUsers)

module.exports = apiUsersRouter