const express = require("express");
const endpointsJson = require("./endpoints.json");


const {
    getTopics
} = require("./controllers/topics.controllers.js");

const {
    getArticles,
    getArticle,
    patchArticle
} = require("./controllers/articles.controllers.js");

const {
    getArticleComments,
    postArticleComment,
    deleteComment
} =require("./controllers/comments.controllers.js");

const {
    getUsers
} = require("./controllers/users.controllers.js");

const {
    handlePsqlErrors,
    handleCustomErrors,
    handleServerErrors
} = require("./controllers/errors.controllers.js");


const app = express();

app.get(`/api`, (request, response) => {
    response.status(200).send({ endpoints: endpointsJson });
});

app.get(`/api/topics`, getTopics);

app.get('/api/articles', getArticles);

app.get(`/api/articles/:article_id`, getArticle);

app.get(`/api/articles/:article_id/comments`, getArticleComments);

app.get(`/api/users`, getUsers);

app.use(express.json());

app.post(`/api/articles/:article_id/comments`, postArticleComment);

app.patch(`/api/articles/:article_id`, patchArticle)

app.delete(`/api/comments/:comment_id`, deleteComment)

app.all('/*', (request, response) => {
    response.status(404).send({ msg: 'Path not found'});
});

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;