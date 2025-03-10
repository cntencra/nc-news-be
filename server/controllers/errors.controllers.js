

exports.handleServerErrors = (error, request, response, next) => {
    console.error(error)
    response.status(500).send("Something has broken!")
}