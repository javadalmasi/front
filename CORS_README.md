# CORS Configuration Issue

This document outlines a critical server-side CORS (Cross-Origin Resource Sharing) issue that affects the production environment.

## The Problem

When the frontend application, running on a different domain, attempts to make an API request (e.g., for login), the browser sends a preflight `OPTIONS` request to the backend at `https://users.vidioo.ir`. The server's response to this preflight request is missing the `Access-Control-Allow-Headers: Content-Type` header.

Because of this missing header, the browser blocks the actual `POST` request, causing the login and other API-dependent features to fail in the production environment.

## The Solution

To fix this, the backend server at `https://users.vidioo.ir` must be configured to include the following header in its response to all `OPTIONS` requests:

```
Access-Control-Allow-Headers: Content-Type
```

## Local Development Workaround

For local development, a proxy has been configured in `vite.config.js`. This proxy forwards requests from `/users-api` to the backend, bypassing the browser's CORS restrictions. This allows the application to function correctly in a development environment.

**Note:** This is a workaround for local development only. The server-side CORS issue must be resolved for the application to work in production.
