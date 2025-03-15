const { request } = require("../app");
const {
    fetchArticles,
    fetchArticle,
    createArticle,
    amendArticle,
    eliminateArticle
} = require("../models/articles.models");

exports.getArticles = async (request, response, next) => {
    try {
        const { articles, total_count } = await fetchArticles(request.query);
        response.status(200).send({ articles, total_count });
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

exports.deleteArticle = async (request,response, next) => {
    try {
        await eliminateArticle(request.params);
        response.status(204).send();
    } catch (error) {
        next(error);
    };
}