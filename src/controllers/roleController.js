
const prisma = require('../prisma/prismaClient');
//get all admins
exports.getAllRoles = async (req, res) => {
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
        const roles = await prisma.roles.findMany({
            skip: skip,
            take: pageSize,
            where: {
                ...roleFilter,
            },
            select:{
                id:true,
                role_name:true,
                role_permissions:{
                    select:{
                        permissions:{
                            select:{
                                id:true,
                                permission_name:true

                            }
                        }
                    }
                }
            }

        });

        // Optionally, get the total number of records for pagination metadata
        const totalRoles = await prisma.roles.count({
            where: {
                ...roleFilter,

            },
        });



        // Send the response with pagination metadata
        if (roles.length > 0) {
            const formattedRoles = roles.map(role => ({
                id: role.id,
                name: role.role_name,
                permissions: role.role_permissions.map(rp => rp.permissions.permission_name)
            }));
            res.send({
                data: formattedRoles,
                total: totalRoles,
                page: pageNumber,
                limit: pageSize,
                status: 230,
                message: "Retrieved Roles Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found", total: totalRoles,
                page: pageNumber,
                limit: pageSize,
            })
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch admins: ' + error.message });
    }
};

//Edit permissions for a Role
exports.editRole = async (req, res) => {
    const roles = req.body;

    try {
        const result = await updatePermissionsForRoles(roles);

        if (result.success) {
            res.status(200).send(result);
        } else {
            res.status(400).send({error:result});
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('API error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


const updatePermissionsForRoles = async (roles) => {
    try {
        const updatePromises = roles.map(async (role) => {
            if (role.removePermissions.length > 0) {
                await prisma.role_permissions.deleteMany({
                    where: {
                        role_id: role.id,
                        permission_id: { in: role.removePermissions },
                    },
                });
            }

            // Add new permissions using createMany
            if (role.addPermissions.length > 0) {
                await prisma.role_permissions.createMany({
                    data: role.addPermissions.map((permissionId) => ({
                        role_id: role.id,
                        permission_id: permissionId,
                    })),
                    skipDuplicates: true, // Prevent duplicates if they already exist
                });
            }
        });

        await Promise.all(updatePromises); // Wait for all promises to resolve

        return { success: true, message: 'Roles updated successfully' };
    } catch (error) {
        console.log(error.message)
            return { success: false, message: error.message };

    }
   
    
};
