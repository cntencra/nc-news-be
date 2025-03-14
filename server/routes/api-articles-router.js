const apiArticlesRouter = require("express").Router();

const {
    getArticles,
    getArticle,
    postArticle,
    patchArticle
} = require("../controllers/articles.controllers.js");

const {
    getArticleComments,
    postArticleComment
 } =require("../controllers/comments.controllers.js");

apiArticlesRouter.get('', getArticles);


apiArticlesRouter.get(`/:article_id`, getArticle);

apiArticlesRouter.get(`/:article_id/comments`, getArticleComments);

apiArticlesRouter.post('', postArticle);

apiArticlesRouter.post(`/:article_id/comments`, postArticleComment);

apiArticlesRouter.patch(`/:article_id`, patchArticle)



module.exports = apiArticlesRouter