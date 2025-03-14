const apiCommentsRouter = require("express").Router();

const {
    deleteComment,
    patchComment
} =require("../controllers/comments.controllers.js");

apiCommentsRouter.patch(`/:comment_id`, patchComment)

apiCommentsRouter.delete(`/:comment_id`, deleteComment)

module.exports = apiCommentsRouter