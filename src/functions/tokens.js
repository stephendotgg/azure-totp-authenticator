const { app } = require('@azure/functions');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const OTP = require('otp');

// Initialize Key Vault client
const credential = new DefaultAzureCredential();
const vaultName = process.env.KEY_VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const secretClient = new SecretClient(vaultUrl, credential);

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
                body: { error: 'Invalid or missing secret ID. Must be in format: totp-{uuid}' }
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
                body: {
                    token,
                    timeRemaining
                }
            };
        } catch (error) {
            context.error('Error retrieving secret:', error);
            return {
                status: 500,
                body: { error: 'Failed to retrieve secret' }
            };
        }
    }
});