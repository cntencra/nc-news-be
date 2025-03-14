const {
    fetchArticles,
    fetchArticle,
    createArticle,
    amendArticle
} = require("../models/articles.models");

exports.getArticles = async (request, response, next) => {
    try {
        const articles = await fetchArticles(request.query);
        response.status(200).send({ articles });
    } catch (error) {
        next(error);
    }
    
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

exports.postArticle = async (request,response, next) => {
    try {
        const article = await createArticle(request.body);
        response.status(201).send({ article })
    } catch (error) {
        next(error)
    }
}

exports.patchArticle = async (request, response, next) => {
    try {
        const { article_id } = request.params;
        const article = await amendArticle(article_id, request.body);
        response.status(201).send({ article });
    } catch (error) {
        next(error)
    }

}