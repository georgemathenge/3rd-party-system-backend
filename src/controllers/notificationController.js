const prisma = require('../prisma/prismaClient');

//get all requests
exports.getAllNotifications = async (req, res) => {
    try {
        // Extract query parameters for pagination and filtering
        const { page = 1, limit = 10, seen_status, date_requested } = req.query;

        // Convert page and limit to integers for calculation
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        const filters = {};

        if (seen_status) filters.seen = seen_status;
        if (date_requested) filters.date_requested = new Date(date_requested); // Assuming date_requested is passed as a string

        // Perform the Prisma query with pagination and filtering
        const requests = await prisma.notifications.findMany({
            skip: skip, // Pagination: skip how many records
            take: pageSize, // Pagination: limit number of records
            where: {
                    ...filters,                
            },
            select: {
                id:true,
                content: true,
                requestor_id: true,
                request_id:true, 
                seen:true,
                created_at:true,
                requestors: {
                    select: {
                        fullnames: true,
                        email: true,
                        requester_type: true,
                        request_purpose: true,
                    },
                },
                
            },
        });

        // Optionally, get the total number of records for pagination metadata
        const totalRequests = await prisma.requests.count({
            where: {
                requestors: {
                    ...filters,
                },
            },
        });

        // Send the response with pagination metadata
        if (requests.length > 0) {
            res.send({
                data: requests,
                total: totalRequests,
                page: pageNumber,
                limit: pageSize,
                status: 230,
                message: "Retrieved Notifications Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found", total: totalRequests,
                page: pageNumber,
                limit: pageSize,
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
