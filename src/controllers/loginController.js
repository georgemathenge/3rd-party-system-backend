
const prisma = require('../prisma/prismaClient');
const SECRET = process.env.SECRET
exports.login = async (req, res) => {
    try {
        const user = await prisma.users.findMany({

            //should be req.body.email
            where: { email: req.body.email }
        })
        console.log('user: ', user);
        if (user.length === 0) {
            res.send(({ status: 404, error: 'Not user with that email', token: null }));
            return;
        }
        const valid = await bcrypt.compare(req.body.password, user[0].password);
        if (!valid) {
            res.send(({ status: 410, error: 'Incorrect password', token: null }));
            return;
        }
   
        const token = jwt.sign({
            user: _.pick(user[0], ['id', 'email', 'role']), ///add p/no
        },
            SECRET,
            {
                expiresIn: '5m',
            });
        const refreshToken = jwt.sign({
            user: _.pick(user[0], ['id', 'email', 'role']),
        },
            SECRET,
            {
                expiresIn: '5m',
            });
        // const response = {
        //   "status": "logged in",
        //   "token":token,
        //   "refreshToken":refreshToken,
        //  }



        res.send(({ status: 230, error: null, token: token, refreshToken: refreshToken, data: user }));
    } catch (e) {
        console.log(e)
    }
};