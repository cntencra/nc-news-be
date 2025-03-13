const apiTopicsRouter = require("express").Router();

const {
    getTopics
} = require("../controllers/topics.controllers.js");

apiTopicsRouter.get(``, getTopics)

module.exports = apiTopicsRouter