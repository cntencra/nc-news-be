const {
    fetchArticles,
    fetchArticle,
    fetchArticleComments
} = require("../models/articles.models");

exports.getArticles = async (request, response) => {
    const articles = await fetchArticles();
    response.status(200).send({ articles });
};

exports.getArticle = async (request, response, next) => {
    try {
        const { article_id } = request.params;
        const article = await fetchArticle(article_id);
        response.status(200).send({ article });
    } catch (error) {
        next(error);
    };
};

exports.getArticleComments = async (request, response, next) => {
    try {
        const { article_id } = request.params;
        const comments = await fetchArticleComments(article_id);
        response.status(200).send({ comments });
        
    } catch (error) {
        next(error);
    };
};