const { app } = require('@azure/functions');
const { randomUUID } = require('crypto');
const { secretClient } = require('../lib/keyVault');

app.http('accounts', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        // First, ensure we have a JSON payload
        let requestBody;
        try {
            requestBody = await request.json();
        } catch (error) {
            context.log('Error parsing request jsonBody:', error);
            return {
                status: 400,
                jsonBody: { 
                    error: 'Invalid request format',
                    details: 'Request body must be valid JSON containing a TOTP URI'
                }
            };
        }

        // Check for the URI in the request
        const { uri } = requestBody;
        if (!uri || typeof uri !== 'string') {
            return {
                status: 400,
                jsonBody: { 
                    error: 'Missing or invalid TOTP URI',
                    details: 'Request must include a "uri" field containing the TOTP setup URI'
                }
            };
        }

        // Parse and validate the TOTP URI
        try {
            const totpUrl = new URL(uri);
            
            // Validate it's a TOTP URI
            if (totpUrl.protocol !== 'otpauth:') {
                throw new Error('URI must use otpauth:// protocol');
            }

            if (totpUrl.host !== 'totp') {
                throw new Error('URI must be for TOTP authentication');
            }

            // Extract the components
            const accountName = decodeURIComponent(totpUrl.pathname.split('/')[1]);
            const secret = totpUrl.searchParams.get('secret');
            const issuer = totpUrl.searchParams.get('issuer');

            // Validate required components
            if (!secret) {
                throw new Error('Missing secret in URI');
            }

            // Store the parsed data for the next step
            const validatedData = {
                accountName,
                secret,
                issuer: issuer || accountName // Fall back to account name if issuer not specified
            };

            // Create a unique name for this secret
            const secretName = `totp-${randomUUID()}`;

            // Store the secret in Key Vault with metadata
            try {
                await secretClient.setSecret(secretName, validatedData.secret, {
                    contentType: 'application/json',
                    tags: {
                        accountName: validatedData.accountName,
                        issuer: validatedData.issuer,
                        type: 'totp-secret'
                    }
                });

                context.log(`Stored new TOTP secret for account ${validatedData.accountName}`);

                return {
                    status: 201,
                    jsonBody: {
                        message: 'TOTP secret stored successfully',
                        secretName: secretName,
                        accountName: validatedData.accountName,
                        issuer: validatedData.issuer
                    }
                };
            } catch (error) {
                context.error('Error storing secret in Key Vault:', error);
                return {
                    status: 500,
                    jsonBody: { error: 'Failed to store TOTP secret' }
                };
            }
        } catch (error) {
            context.log('Error validating TOTP URI:', error);
            return {
                status: 400,
                jsonBody: { 
                    error: 'Invalid TOTP URI',
                    details: error.message
                }
            };
        }
    }
});
