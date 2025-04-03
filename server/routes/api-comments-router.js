const apiCommentsRouter = require("express").Router();

const {
    deleteComment,
    patchComment,
    getComments
} =require("../controllers/comments.controllers.js");

apiCommentsRouter.get(`/:username`, getComments)

apiCommentsRouter.patch(`/:comment_id`, patchComment)

apiCommentsRouter.delete(`/:comment_id`, deleteComment)

module.exports = apiCommentsRouter