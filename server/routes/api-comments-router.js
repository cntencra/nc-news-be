const apiCommentsRouter = require("express").Router();

const {
    deleteComment
} =require("../controllers/comments.controllers.js");

apiCommentsRouter.delete(`/:comment_id`, deleteComment)

module.exports = apiCommentsRouter