import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Complete details of connectionInstance: ${connectionInstance}`)
        console.log(`\n MongoDB connected 👻 DB Host: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MONGODB connection error", error)
        process.exit(1) //read about process which is provided by npm
    }
}

export default connectDB