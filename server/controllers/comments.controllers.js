const {
    fetchArticleComments,
    createArticleComment,
    eliminateComment
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
        const comment = await createArticleComment(article_id, request.body);
        response.status(201).send({ comment });
        
    } catch (error) {
        next(error);
    };
};

exports.deleteComment = async (request, response, next) => {
    try {
        const { comment_id } = request.params;
        await eliminateComment(comment_id);
        response.status(204).send();
    } catch (error) {
        next(error);
    }
}