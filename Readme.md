
# StreamSync: Comprehensive Backend for Video Streaming Platform

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction
StreamSync is a scalable and efficient backend for a video streaming platform. It provides robust video management, user authentication, real-time updates, and comprehensive channel statistics using advanced aggregation techniques. StreamSync ensures secure API endpoints and enhanced user engagement through real-time video view counts and user watch history updates.

## Features
- **Scalable Backend**: Developed using Node.js, Express, and MongoDB.
- **User Authentication**: Secure JWT-based authentication.
- **Video Management**: Efficient management of video data.
- **Real-Time Updates**: Real-time video view count and user watch history updates.
- **Channel Statistics**: Aggregates total views, likes, videos, and subscribers.
- **Security**: Robust protection of user data.

## Technologies Used
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Aggregation Pipelines

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/StreamSync.git
   cd StreamSync
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/streamsync
   JWT_SECRET=your_jwt_secret
   ```

## Configuration
Ensure MongoDB is running on your machine or configure the `MONGO_URI` in the `.env` file to point to your MongoDB instance.

## Usage
1. Start the server:
   ```sh
   npm run dev
   ```

2. The server will be running on `http://localhost:8000`.

## API Endpoints

### User and Authentication
- **POST /api/v1/users/register**: Register a new user.
- **POST /api/v1/users/login**: Login a user and receive a JWT.
- **POST /api/v1/users/logout**: Logout a user.
- **POST /api/v1/users/change-password**: Change user's password.
- **PATCH /api/v1/users/update-account**: Update user's account details.
- **POST /api/v1/users/refresh-token**: Refresh user's access token.
- **PATCH /api/v1/users/avatar**: Update user's avatar/profile image.
- **PATCH /api/v1/users/cover-image**: Update user's cover image.
- **GET /api/v1/users/current-user**: Get current user.
- **GET /api/v1/users/c/:username**: Get user's channel profile.
- **GET /api/v1/users/history**: Get user's watch History.
    
## Postman Documentation For API Endpoints
   https://api.postman.com/collections/33482892-a20f6fa3-4b86-426e-9541-e0109e4b231e?access_key=PMAT-01JFDJN72A5XZXMDY1ZBV924K4

## Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to contribute to the project by submitting issues, feature requests, and pull requests. If you have any questions or need further assistance, please contact me.
