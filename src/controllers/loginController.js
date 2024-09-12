
const prisma = require('../prisma/prismaClient');
const ApiAuth = require('../services/externalApiService')
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const SECRET = process.env.SECRET
exports.login = async (req, res) => {
    try {
const {ad_acc, user_pass }= req.body
const response = await ApiAuth(ad_acc, user_pass)

if(response.status == 200){
        const user = await prisma.admins.findMany({
            where: { admin_email: response.data.email },
            select:{
                id:true,
                admin_name:true,
                admin_email:true,
               roles:{
                select:{
                    id:true,
                    role_name:true,
                }
               }
            }
        })
        if (user.length === 0) {
            res.send(({ status: 404, error: 'Admin account not found', token: null }));
            return;
        }
        // const valid = await bcrypt.compare(req.body.password, user[0].password);
        // if (!valid) {
        //     res.send(({ status: 410, error: 'Incorrect password', token: null }));
        //     return;
        // }
   
        const token = jwt.sign({
            user: _.pick(user[0], ['id', 'admin_name']), 
            role: _.pick(user[0].roles, ['id', 'role_name']), 
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
    
        res.send(({ status: 230, error: null, token: token, refreshToken: refreshToken, data: user }));
   
}
else {
    res.send({status:response.status, message:response.message})
}


 } catch (e) {
        console.log(e)
    }
};