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

//get all requests
exports.getAllRequests = async (req, res) => {
    try {
        // Extract query parameters for pagination and filtering
        const { page = 1, limit = 10, fullnames, email, requester_type, request_purpose, date_requested } = req.query;

        // Convert page and limit to integers for calculation
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize; 
        const filters = {};

        if (fullnames) filters.fullnames = { contains: fullnames };
        if (email) filters.email = { contains: email };
        if (requester_type) filters.requester_type = requester_type;
        if (request_purpose) filters.request_purpose = request_purpose;
        if (date_requested) filters.date_requested = new Date(date_requested); // Assuming date_requested is passed as a string

        // Perform the Prisma query with pagination and filtering
        const requests = await prisma.requests.findMany({
            skip: skip, // Pagination: skip how many records
            take: pageSize, // Pagination: limit number of records
            where: {
                requestors: {
                    // Apply filters to requestors relation
                    ...filters,
                },
            },
            select: {
                id:true,
                description: true,
                date_requested: true,
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
        if(requests.length >0){
            res.send({
                data: requests,
                total: totalRequests,
                page: pageNumber,
                limit: pageSize,
                status: 230,
                message: "Retrieved Requests Successfully"
            });
        }
        else{
            res.send({
                status: 404, message: "No data found", total: totalRequests,
                page: pageNumber,
                limit: pageSize,
})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};
exports.getRequestById = async (req, res) => {
    try {
        
        // Perform the Prisma query with pagination and filtering
        const requests = await prisma.requests.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                requestors:true,
                 requestors_documents:true,
            },
        });


        // Send the response with pagination metadata
        if (requests != null) {
            res.send({
                data: requests,
                status: 230,
                message: "Retrieved Requests Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found", total: totalRequests,
               
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

exports.reviewRequest = async (req, res) => {
    try {
    const {review_status, reviewed_by} =req.body;
        // Perform the Prisma query with pagination and filtering
        const requests = await prisma.requests.findUnique({
            where: {
                id: parseInt(req.params.id),
                tracking_status: { contains: 'requested' }
            },
        });
        

        // Send the response with pagination metadata
        if (requests ) {
             await prisma.requests.update({
                where: {
                    id: parseInt(req.params.id),
                },
                data: {
                    review_status: review_status,
                    tracking_status:"reviewed",
                    reviewed_by:reviewed_by,
                    date_reviewed: formattedDate,
                },
            });
            if(review_status =="rejected"){
                try {
                    //send notification 
                     //fetch the email details from the request details and notify the requester
                } catch (error) {

                    
                }
            }

            res.send({
                status: 230,
                message: "Review saved Successfully"
            });
        }
        else {
            res.send({
                status: 404, message: "No data found"

            })
        }
       
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Unable to save review', error:error.message });
    }
};
exports.allocateRequest = async (req, res) => {
    try {
        const { allocation_status, allocated_by } = req.body;
        // Perform the Prisma query with pagination and filtering
       
        const requests = await prisma.requests.findUnique({
            where: {
                id: parseInt(req.params.id),
                tracking_status: { contains: 'reviewed' },
                review_status: { contains: 'approved' }

            },
        });
        if (requests) {
            await prisma.requests.update({
                where: {
                    id: parseInt(req.params.id)
                },
                data: {
                    allocation_status: allocation_status,
                    tracking_status:"allocated",
                    allocated_by: allocated_by,
                    allocated_on: formattedDate,
                },
            });
            // Send the response with pagination metadata
                res.send({
                    status: 230,
                    message: "Request allocated Successfully"
                });
        }

        else {
            res.send({
                status: 401, message: "Unable to allocate request: Request not found"

            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: `Unable to save review:${error.message}` });
    }
};
exports.resolveRequest = async (req, res) => {
    try {
        const { allocatee_status, allocatee_feedback, allocatee_attachments } = req.body;
        // Perform the Prisma query with pagination and filtering

        const requests = await prisma.requests.findUnique({
            where: {
                id: parseInt(req.params.id),
                tracking_status: { contains: 'allocated' },
            },
        });
        if (requests) {
            await prisma.requests.update({
                where: {
                    id: parseInt(req.params.id)
                },
                data: {
                    allocatee_status: allocatee_status,
                    tracking_status: "resolved",
                    allocatee_feedback: allocatee_feedback,
                    allocatee_attachments:allocatee_attachments,
                    allocatee_feedback_on:formattedDate
                },
            });

try {
    //send communication to the relevant parties eg requester, allocater 
    //communication is through mail 
} catch (error) {
    
}

            res.send({
                status: 230,
                message: "Request resolved Successfully"
            });
        }

        else {
            res.send({
                status: 401, message: "Unable to allocate request: Request not found"

            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: `Unable to save review:${error.message}` });
    }
};