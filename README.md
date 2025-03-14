# Azure TOTP Authenticator

This project demonstrates how to build a custom Time-based One-Time Password (TOTP) solution using Azure's cloud services. The application leverages Azure Functions for the backend API, Azure Key Vault for secure secrets management, and Azure Static Web Apps for the frontend. This solution supports the standard TOTP protocol (RFC 6238) and integrates seamlessly with services like GitHub and Microsoft's authentication systems.

## Overview

Two-factor authentication (2FA) is a vital security measure for protecting accounts from unauthorized access. While many rely on popular apps like Microsoft Authenticator, building your own TOTP authenticator provides valuable customizations and security controls. This solution aims to demonstrate how to securely manage and generate TOTP codes using Azure services.

### Key Features
- **Backend API** built with Azure Functions
- **Secret management** using Azure Key Vault
- **TOTP token generation** using standard algorithms
- **Secure server-side secret storage** to prevent client-side vulnerabilities

## Architecture

The application consists of two main components:
- **Backend API (Azure Functions)**: Manages TOTP secrets and generates time-based tokens.
- **Secret Storage (Azure Key Vault)**: Secures TOTP secrets with hardware-level encryption and easy access control.

## Security and Scalability
By using Azure's managed services, the app ensures secure secret storage, scalability, and fault tolerance. Azure Functions offer automatic scaling, and Azure Key Vault ensures that secrets are managed securely with features like key rotation and access auditing.

## Blog Post
For the detailed setup steps and how to get this app up and running in your own Azure environment, check out the full blog post: [Building a TOTP Authenticator App on Azure Functions and Azure Key Vault](https://techcommunity.microsoft.com/blog/appsonazureblog/building-a-totp-authenticator-app-on-azure-functions-and-azure-key-vault/4361821).

## Trademarks
This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft’s Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.
