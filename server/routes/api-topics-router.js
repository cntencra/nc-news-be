const apiTopicsRouter = require("express").Router();

const {
    getTopics,
    postTopic
} = require("../controllers/topics.controllers.js");

apiTopicsRouter.get(``, getTopics);

apiTopicsRouter.post(``, postTopic);

module.exports = apiTopicsRouter