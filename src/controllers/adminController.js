const prisma = require('../prisma/prismaClient');
const timestamp = new Date()
function formatDateToCustomFormat(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
const formattedDate = formatDateToCustomFormat(timestamp);

//get all admins
exports.getAllAdmins = async (req, res) => {
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
        if (email) filters.email = { contains: email };
        if (requester_type) filters.requester_type = requester_type;
        if (request_purpose) filters.request_purpose = request_purpose;
        if (date_requested) roleFilter.date_requested = date_requested;

        req.user_role = "cd";
        req.user_id = 1; //switch this to p/no

        // Role-based filter map (scalable)
        const roleBasedFilters = {
            cm: { requester_type: { in: ["requester_type_2", "requester_type_3"] } },
            dc: { requester_type: { in: ["requester_type_2", "requester_type_4"] } },
        };

        const accessFilters = {
            allocatee: { allocation_status: "allocated", allocated_to: `${req.user_id}` },
        };


        // Apply role-specific filters
        if (req.user_role && roleBasedFilters[req.user_role]) {
            roleFilter.review_status = "approved"
            Object.assign(filters, roleBasedFilters[req.user_role]);
        }
        // Apply allocatee-specific filters
        if (req.user_role === "allocatee") {
            Object.assign(roleFilter, accessFilters[req.user_role]);
        }
        // Perform the Prisma query with pagination and filtering
        const requests = await prisma.admins.findMany({
            skip: skip,
            take: pageSize, 
            where: {
                ...roleFilter,
                },
           
        });

        // Optionally, get the total number of records for pagination metadata
        const totalAdmins = await prisma.admins.count({
            where: {
                ...roleFilter,
            
            },
        });

        // Send the response with pagination metadata
        if (requests.length > 0) {
            res.send({
                data: requests,
                total: totalAdmins,
                page: pageNumber,
                limit: pageSize,
                status: 230,
                message: "Retrieved Admins Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found", total: totalAdmins,
                page: pageNumber,
                limit: pageSize,
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admins: '+error.message });
    }
};

exports.getAdminsById = async (req, res) => {
    try {

        // Perform the Prisma query with pagination and filtering
        const admins = await prisma.admins.findUnique({
            where: {
                id: parseInt(req.params.id)
            }           
        });


        // Send the response with pagination metadata
        if (admins != null) {
            res.send({
                data: admins,
                status: 230,
                message: "Retrieved Admin Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No Admins found"

            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Failed to fetch admins: '+error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { admin_name, admin_email, admin_role_id, allocated_by } = req.body;
        // Perform the Prisma query with pagination and filtering

         const admin = await prisma.admins.create({
                data: {
                    admin_name: admin_name,
                    admin_email: admin_email,
                    admin_role_id: admin_role_id,
                    created_by: req.user_id,//fetch the user_id from the authentication middleware
                    created_on: formattedDate,
                },
            });
            // Make communicate to Admin on Account Creation
            res.send({
                status: 230,
                message: "Admin created Successfully",
                data:admin
            });
    } catch (error) {
        if (error.code === 'P2002') {
            return { status: 409, message: 'Conflict: Duplicate entry' };
        } else if (error.code === 'P2025') {
            return { status: 404, message: 'Foreign key constraint failed' };
        } else {
            return { status: 500, message: `Database error: ${error.message}` };
        }
    }
};

exports.updateUpdateAdminDetails= async (req, res) => {
    try {
        const { admin_name, admin_email, admin_role_id, allocated_by } = req.body;
        const admin = await prisma.admins.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });
        if (admin) {
            await prisma.admins.update({
                where: {
                    id: parseInt(req.params.id)
                },
                data: {
                    admin_name: admin_name,
                    admin_email: admin_email,
                    admin_role_id: admin_role_id,
                    last_edited_by: req.user_id,//fetch the user_id from the authentication middleware
                    last_edited_on: formattedDate,
                },
            });
            res.send({
                status: 230,
                message: "Admin edited Successfully"
            });
        }
        else {
            res.send({
                status: 401, message: "Unable to update admin: Admin not found"
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: `Internal Server Error:${error.message}` });
    }
};