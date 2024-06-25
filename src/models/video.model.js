import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new Schema(
    {
        videoFile:{
            type: String, // cloudinary link
            required: true
        },
        thumbnail:{
            type: String, //cloudinary link
            required: true
        },
        title:{
            type: String,
            required: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        description:{
            type: String,
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished:{
            type: Boolean,
            default: false,
            required: true
        },

    },
    {timestamps: true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)