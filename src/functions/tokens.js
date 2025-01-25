const { app } = require('@azure/functions');
const { secretClient } = require('../lib/keyVault');
const OTP = require('otp');

app.http('tokens', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // Get the secret ID from query parameters
        const secretId = request.query.get('id');
        
        // Validate the secret ID format
        if (!secretId || !secretId.startsWith('totp-')) {
            return {
                status: 400,
                jsonBody: { error: 'Invalid or missing secret ID. Must be in format: totp-{uuid}' }
            };
        }

        try {
            // Retrieve the secret from Key Vault
            const secret = await secretClient.getSecret(secretId);

            // Create a new TOTP instance with 30-second window
            const totp = new OTP({ secret: secret.value });
            
            // Generate the current token
            const token = totp.totp();
            
            // Calculate remaining seconds in this 30-second window
            const timeRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);

            return {
                status: 200,
                jsonBody: {
                    token,
                    timeRemaining
                }
            };
        } catch (error) {
            context.error('Error retrieving secret:', error);
            return {
                status: 500,
                jsonBody: { error: 'Failed to retrieve secret' }
            };
        }
    }
});