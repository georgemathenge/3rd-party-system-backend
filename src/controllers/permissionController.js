
const prisma = require('../prisma/prismaClient');
//get all admins
exports.getAllPermissions = async (req, res) => {
    try {
        // Extract query parameters for pagination and filtering
        const { page = 1, limit = 10, fullnames, email, requester_type, request_purpose, date_requested } = req.query;

        // Convert page and limit to integers for calculation
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        const filters = {};
        const roleFilter = {};

        if (fullnames) filters.fullnames = { contains: fullnames };
       
        // Apply role-specific filters
        // if (req.user_role && roleBasedFilters[req.user_role]) {
        //     roleFilter.review_status = "approved"
        //     Object.assign(filters, roleBasedFilters[req.user_role]);
        // }
        // // Apply allocatee-specific filters
        // if (req.user_role === "allocatee") {
        //     Object.assign(roleFilter, accessFilters[req.user_role]);
        // }
        // Perform the Prisma query with pagination and filtering
        const permissions = await prisma.permissions.findMany({
            skip: skip,
            take: pageSize,
            select:{
id:true,
permission_name:true
            }
    
        });
        // Optionally, get the total number of records for pagination metadata
        const totalPermissions = await prisma.roles.count({
        });

        // Send the response with pagination metadata
        if (permissions.length > 0) {
            res.send({
                data: permissions,
                total: totalPermissions,
                page: pageNumber,
                limit: pageSize,
                status: 230,
                message: "Retrieved Permissions Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found", total: totalPermissions,
                page: pageNumber,
                limit: pageSize,
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch permissions: ' + error.message });
    }
};

