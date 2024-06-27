import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// applying limit on json files so that it does not overloads our server.
app.use(express.json({limit:"16kb"}))
// handling encoded url like: js backend = js+backend or js%20backend
app.use(express.urlencoded({extended:true, limit: "16kb"}))
//to store images or files in our server
app.use(express.static("public"))
// to store cookies on users browser and to perform crud operations there
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import healthheckRouter from "./routes/healthcheck.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
// the above line will work as http://localhost:8000/api/v1/users/register
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/healthcheck", healthheckRouter)


export { app }