
const prisma = require('../prisma/prismaClient');
const ApiAuth = require('../services/externalApiService')
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const dayjs = require('dayjs');

const now = dayjs();
const formattedDate = now.format('YYYY-MM-DD HH:mm:ss');

const SECRET = process.env.SECRET
exports.login = async (req, res) => {
    try {
const {ad_acc, user_pass }= req.body
        if (!ad_acc || !user_pass) {
            return res.status(400).json({ error: 'ad_acc and user_pass are required', status :400 });
        }
const response = await ApiAuth(ad_acc, user_pass)
        let roleName = "requester"
if(response.status == 200){
        let user = await prisma.admins.findMany({
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
        if (user.length ===0) {
            // Find the role by its name
            let role = await prisma.roles.findFirst({
                where: {
                    role_name: roleName,
                },
            });

            // If the role doesn't exist, you can create one (optional)
            if (!role) {
                role = await prisma.roles.create({
                    data: {
                        role_name: roleName,
                    },
                });
            }

             const newUser = await prisma.admins.create({
                data: {
                     admin_name: response.data.admin_name,
                     admin_email: response.data.email,
                     created_by:"system",
                     created_on: formattedDate,
                     roles:{
                         connect: { 
                            id: role.id 
                        },
                     }
                     },
              
            })
            user = [newUser]; 
         
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
    
        res.send(({ status: 230, error: null,message:"Login Successful", token: token, refreshToken: refreshToken}));
   
}
else {
    res.send({status:response.status, message:response.message})
}


 } catch (e) {
        console.log(e)
    }
};