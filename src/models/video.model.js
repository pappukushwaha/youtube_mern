import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number, //
            required: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        isPublished : {
            type: Boolean,
            default: true,
        },// default is true
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },{
        timestamps: true
    }
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);
