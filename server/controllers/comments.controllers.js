const {
    fetchArticleComments,
    createArticleComment
} = require("../models/comments.models")

exports.getArticleComments = async (request, response, next) => {
    try {
        const { article_id } = request.params;
        const comments = await fetchArticleComments(article_id);
        response.status(200).send({ comments });
        
    } catch (error) {
        next(error);
    };
};

exports.postArticleComment = async (request,response, next) => {
    try {
        const { article_id } = request.params;
        const comment = await createArticleComment(article_id);
        response.status(200).send({ comment });
        
    } catch (error) {
        next(error);
    };
};