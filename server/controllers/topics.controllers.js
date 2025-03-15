const {
    fetchTopics,
    createTopic
} = require("../models/topics.models");

exports.getTopics = async (request, response,next) => {
    try {
        const topics =  await fetchTopics();
        response.status(200).send({ topics });
    } catch (error) {
        next(error);
    };
};

exports.postTopic = async (request, response, next) => {
    try {
        const topic = await createTopic(request.body);
        response.status(201).send({topic});
        
    } catch (error) {
        next(error);
    };
};