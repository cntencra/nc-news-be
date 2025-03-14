const apiRouter = require("express").Router();
const apiTopicsRouter = require("./api-topics-router.js");
const apiArticlesRouter = require("./api-articles-router.js");
const apiUsersRouter = require("./api-users-router.js");
const apiCommentsRouter = require("./api-comments-router.js");

const endpointsJson = require("../endpoints.json");


apiRouter.get("",(request, response) => {
    response.status(200).send({ endpoints: endpointsJson });
});

apiRouter.use(`/topics`, apiTopicsRouter);

apiRouter.use('/articles', apiArticlesRouter);

apiRouter.use(`/users`, apiUsersRouter);

apiRouter.use(`/comments`, apiCommentsRouter)

module.exports = apiRouter