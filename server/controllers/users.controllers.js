const { fetchUsers } = require("../models/users.models")

exports.getUsers = async ( request , response ) => {
    try {
        const users = await fetchUsers();
        response.status(200).send({users});  
    } catch (error) {
        next(error);
    };
};