const { fetchUsers } = require("../models/users.models")

exports.getUsers = async ( request , response ) => {
    const users = await fetchUsers();
    response.status(200).send({users}); 
};