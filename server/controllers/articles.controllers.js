const {
    fetchArticles
} = require("../models/articles.models");

exports.getArticles = async (request, response, next) => {
    try {
        const { article_id } = request.params;
        const article = await fetchArticles(article_id);
        response.status(200).send({ article });
    } catch (error) {
        next(error);
    };
};