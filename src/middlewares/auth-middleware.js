const jwt = require('jsonwebtoken')
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET, async (err, result) => {
            if (err) {
                res.send({ status: 340, error: err.message, data: [] })
            }
            else {
                req.user_id = result.user.id;
                req.user_role = result.user.role;
                next()
            }

        });


    } catch (e) {
        console.log(e.message)
        res.send({ status: 500, e: e.message })

    }
};