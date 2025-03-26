const http = require('http');
const axios = require('axios');


const hostname = process.env.ACME_AGENT_HOST || 'host.docker.internal';
const port = 8041;


console.log('Agent is running on: ' + `http://${hostname}:${port}`);


class AgentService {

    async getStatus() {
        try {
            const response = await axios.get(`http://${hostname}:${port}/status`);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    async getConnections() {
        try {
            const response = await axios.get(`http://${hostname}:${port}/connections`);
            return response.data.results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createInvitation() {
        try {
            // Define the request payload
            const invitationRequest = {
                handshake_protocols: ["https://didcomm.org/didexchange/1.1"]
            };
    
            // Make the POST request using axios
            const response = await axios.post(`http://${hostname}:${port}/out-of-band/create-invitation`, invitationRequest, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            // Log the invitation data
            console.log("Invitation created successfully:", response.data);
    
            return response.data;
        } catch (error) {
            // Log any errors
            console.error("Error creating invitation:", error.message);
            return {};
        }
    }

// async receiveInvitation(invitation) {
//     try {
//         // Step 1: Receive the invitation
//         const receiveInvitationUrl = `http://${hostname}:${port}/out-of-band/receive-invitation`;
//         console.log('Sending request to /out-of-band/receive-invitation with URL:', receiveInvitationUrl);
//         console.log('Request body:', JSON.stringify(invitation));

//         const response = await axios.post(receiveInvitationUrl, invitation, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         console.log('API response from /out-of-band/receive-invitation:', response.data);

//         // Step 2: Extract connection ID and accept the invitation
//         const connId = response.data.connection_id;
//         if (connId) {
//             const acceptInvitationUrl = `http://${hostname}:${port}/didexchange/${connId}/accept-invitation`;
//             console.log(`Sending request to /didexchange/${connId}/accept-invitation with URL:`, acceptInvitationUrl);

//             await axios.post(acceptInvitationUrl, {}, {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             });

//             console.log(`Invitation accepted for connection ID: ${connId}`);
//         } else {
//             console.error('No connection ID found in the response.');
//         }

//         return response.data;
//     } catch (error) {
//         console.error('Error in receiveInvitation:', error.message);
//         if (error.response) {
//             console.error('Response data:', error.response.data);
//             console.error('Response status:', error.response.status);
//         }
//         throw error; // Propagate the error to the caller
//     }
// }

async receiveInvitation(invitation) {
    try {
        // Step 1: Receive the invitation
        const receiveInvitationUrl = `http://${hostname}:${port}/out-of-band/receive-invitation`;
        console.log('Sending request to /out-of-band/receive-invitation with URL:', receiveInvitationUrl);
        console.log('Request body:', JSON.stringify(invitation));

        const response = await axios.post(receiveInvitationUrl, invitation, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API response from /out-of-band/receive-invitation:', response.data);

        return response.data; // Return only the response from receive-invitation
    } catch (error) {
        console.error('Error in receiveInvitation:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error; // Propagate the error to the caller
    }
}

async removeConnection(connectionId) {
    if (!connectionId) {
        console.error('Must provide a connection ID');
        return;
    }

    console.log(`Removing connection with ID: ${connectionId}`);

    try {
        await axios.delete(`http://${hostname}:${port}/connections/${connectionId}`);
        console.log(`Connection with ID ${connectionId} removed successfully`);
    } catch (error) {
        console.error(`Failed to remove connection with ID ${connectionId}:`, error);
    }
}

async  getProofRequests() {
    try {
        const response = await axios.get(`http://${hostname}:${port}/present-proof-2.0/records`);
        return response.data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async  sendProofRequest(proofRequest) {
    try {
        await axios.post(`http://${hostname}:${port}/present-proof-2.0/send-request`, proofRequest, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(error);
    }
}

}

module.exports = new AgentService();