const jwt = require('jsonwebtoken')
module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) return res.send({ status: 403, message: "Authenication Required", data: [] })
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET, async (err, result) => {
            if (err) {
                res.send({ status: 340, error: err.message, data: [] })
            }
            else {
                req.user_id = result.user.id;
                req.user_role = result.role.role_name;
                next()
            }

        });


    } catch (e) {
        console.log(e.message)
        res.send({ status: 500, e: e.message })

    }
};