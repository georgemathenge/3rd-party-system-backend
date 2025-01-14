const prisma = require('../prisma/prismaClient');
const ApiAuth = require('../services/externalApiService');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const dayjs = require('dayjs');
const now = dayjs();
const formattedDate = now.format('YYYY-MM-DD HH:mm:ss');
const SECRET = process.env.SECRET;

exports.login = async (req, res) => {
    try {
        const { ad_acc, user_pass } = req.body;

        if (!ad_acc || !user_pass) {
            return res.status(400).json({ error: 'ad_acc and user_pass are required', status: 400 });
        }

        const response = await ApiAuth(ad_acc, user_pass);
        let roleName = "requester";

        if (response.status == 200) {
            // Fetch user and roles from the database
            let user = await prisma.admins.findMany({
                where: { admin_email: response.data.email },
                select: {
                    id: true,
                    admin_name: true,
                    admin_email: true, // Add admin_email to the select statement
                    roles: {
                        select: {
                            id: true,
                            role_name: true,
                        }
                    }
                }
            });

            if (user.length === 0) {
                // If user does not exist, create a new role and user
                let role = await prisma.roles.findMany({
                    where: { role_name: roleName }
                });

                if (role.length === 0) {
                    role = await prisma.roles.create({
                        data: { role_name: roleName }
                    });
                }

                user = await prisma.admins.create({
                    data: {
                        admin_name: response.data.admin_name,
                        admin_email: response.data.email,
                        created_by: "system",
                        created_on: formattedDate,
                        roles: {
                            connect: {
                                id: role.id
                            }
                        }
                    }
                });
            }

            // Ensure roles is an array
            const roles = Array.isArray(user[0].roles) ? user[0].roles : []; // If roles is not an array, use an empty array

            // Create JWT token
            const token = jwt.sign({
                user: _.pick(user[0], ['id', 'admin_name', 'admin_email']), // Include admin_email
                role: roles.map(role => ({ id: role.id, role_name: role.role_name })) // Include both id and role_name
            }, SECRET, { expiresIn: '5m' });

            const refreshToken = jwt.sign({
                user: _.pick(user[0], ['id', 'email']), // Include email in the refresh token payload
            }, SECRET, { expiresIn: '5m' });

            // Send the response with token, refreshToken, and user data (including email)
            res.send({
                status: 230,
                error: null,
                message: "Login Successful",
                token: token,
                refreshToken: refreshToken,
                user: _.pick(user[0], ['admin_name', 'admin_email']), // Include email in the user object
                roles: roles.map(role => ({ id: role.id, role_name: role.role_name })) // Send roles with both id and role_name
            });
        } else {
            res.send({ status: response.status, message: response.message });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: 'Internal server error' });
    }
};