
const User = require('../model/user');

async function createUser({ email, name, role }) {
    try {
        const user = await User.create({
            email: email,
            name: name,
            role: role
        });
        return user;
    } catch (error) {
        console.error(error);
        throw error; // Throwing the error for higher-level handling if needed
    }
}

async function findeUserbyemail({ email }) {
    try {
        const user = await User.findOne({where:{email:email}});
        console.log(user);
        return user;
    } catch (error) {
        console.error(error);
        throw error; // Throwing the error for higher-level handling if needed
    }
}


module.exports = { createUser, findeUserbyemail };

