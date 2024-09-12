const axios = require('axios');

const fetchDataFromExternalApi = async (param1Value, param2Value) => {
    try {
        const encodedCredentials = Buffer.from(`${param1Value}:${param2Value}`).toString('base64');

        const response = await axios.get('http://10.153.1.64:8595/user/login', {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`
            }
        },
    );
        return {status:response.status,data:response.data};
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            // Handle different status codes with corresponding messages
            switch (status) {
                case 401:
                    return { status: 401, message: error.response.data.message };
                case 404:
                    return { status: 404, message: 'Resource not found.' };
                case 500:
                    return { status: 500, message: 'Internal Server Error.', error:error.response.data.message };
                default:
                    return { status: status, message: `Unexpected error occurred. Status code: ${status}` };
            }
        } else if (error.request) {
            // No response was received
            return { status: 503, message: 'No response received from the server.' };
        } else {
            // Some other error occurred while setting up the request
            return { status: 500, message: `Request error: ${error.message}` };
        }
    }
};
module.exports= fetchDataFromExternalApi


