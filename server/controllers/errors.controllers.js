exports.handlePsqlErrors = (error, request, response, next) => {
    if(error.code === '22P02') {
        response.status(400).send({ msg: "Bad request" });
    } else if (error.code === '23502') {
        response.status(400).send({msg: "NOT NULL VIOLATION"})
    } else {
        next(error);
    };
};

exports.handleCustomErrors = (error, request, response, next) => {
    if(error.status) {
        response.status(error.status).send({ msg: error.msg });
    } else {
        next(error);
    };
    
};

exports.handleServerErrors = (error, request, response, next) => {
    console.error(error)
    response.status(500).send("Something has broken!");
};