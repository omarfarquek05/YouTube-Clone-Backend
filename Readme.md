# Full-Stack Backend

This project contains the backend code for the Full-Stack application.

# Project Summary

Summary of this project
This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have. We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.

## Features

- RESTful API endpoints
- Database integration
- Authentication & Authorization
- custom Error handling
- Custom Api Response
- Custom Middleware handling
- File handling such as image/video handing with cloudinary

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm 

### Project Details

- **Name:** backend
- **Version:** 1.0.0
- **Main Entry:** `index.js`
- **Type:** module

#### Scripts

- `dev`: Starts the server with nodemon for automatic restarts.

#### Dependencies

- **bcrypt**: Password hashing
- **cloudinary**: Cloud-based image and video management
- **cookie-parser**: Parse cookies for authentication
- **cors**: Enable Cross-Origin Resource Sharing
- **dotenv**: Manage environment variables
- **express**: Web framework for Node.js
- **jsonwebtoken**: JWT authentication
- **mongodb**: MongoDB driver
- **mongoose**: MongoDB object modeling
- **mongoose-aggregate-paginate-v2**: Pagination for Mongoose aggregates
- **multer**: File uploads
- **nodemon**: Development server auto-restart
- **prettier**: Code formatting

#### License

- ISC

You can find all dependencies and scripts in the `package.json` file.
### Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### Running the Server

```bash
npm run dev
```

## Folder Structure

```
/backend
    /controller
    /model
    /route
    /middleware
    /utils
    /db
    /public/temp
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=8000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=Your_cloudinary_cloud_name
CLOUDINARY_API_KEY=Your_cloudinary_api_key
CLOUDINARY_API_SECRET=Your_cloudinary_api_secret_key
```

## License

This project is licensed under the MIT License.