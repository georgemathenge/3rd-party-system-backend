// Here is where authentication and authorization comes in
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const fetchrolePermissions = async () => {
    try {
        const roles = await prisma.role_permissions.findMany({
            include: {
                permissions: {
                    select: {
                        permission_name: true
                    }
                },
                roles: {
                    select: {
                        role_name: true
                    }
                }
            }
        })
        return roles.reduce((acc, rolePermission) => {
            const roleName = rolePermission.roles.role_name;
            const permissionName = rolePermission.permissions.permission_name;

            if (!acc[roleName]) {
                acc[roleName] = [];
            }

            acc[roleName].push(permissionName);

            return acc;
        }, {});
    } catch (e) {
        console.log(e)
    }
}

function authorizePermission(permission) {
    return async (req, res, next) => {
        const formattedRoles = await fetchrolePermissions()
        const userPermissions = formattedRoles[req.user_role];
        if (!userPermissions || !userPermissions.includes(permission)) {
            return res.status(403).json({ message: 'Access forbidden: insufficient permissions. Please Contact your administrator' });
        }
        next();
    };
}
module.exports = authorizePermission;

