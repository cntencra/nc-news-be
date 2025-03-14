const { 
    fetchUsers,
    fetchUser
 } = require("../models/users.models")

exports.getUsers = async ( request , response, next ) => {
    try {
        const users = await fetchUsers();
        response.status(200).send({users});  
    } catch (error) {
        next(error);
    };
};

exports.getUser = async ( request , response, next ) => {
    try {
        const { username } = request.params
        const user = await fetchUser(username);
        console.log(user);
        response.status(200).send({user});  
    } catch (error) {
        next(error);
    };
};
