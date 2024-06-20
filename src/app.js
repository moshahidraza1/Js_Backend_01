import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

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

//routes declaration
app.use("/api/v1/users", userRouter)
// the above line will work as http://localhost:8000/api/v1/users/register

export { app }