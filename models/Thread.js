const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Reply = require("./Reply"); // Убедитесь, что путь правильный

const ThreadSchema = new mongoose.Schema({
    board: {
        type: String,
        required: [true, "Board must be provided."]
    },
    delete_password: {
        type: String,
        required: [true, "Password for thread must be provided"]
    },
    reported: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        required: [true, "Text needs to be entered in the reply."],
        maxlength: 250
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    bumped_on: {
        type: Date,
        default: Date.now
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply"
    }],
}, {
    // timestamps: true
});
/*
ThreadSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.delete_password = await bcrypt.hash(this.delete_password, salt);
});

ThreadSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.delete_password);
    return isMatch;
};

ThreadSchema.post('remove', function (doc) {
    Reply.deleteMany({
        _id: {
            "$in": doc.replies
        }
    }, {}, function (err) {});
}); */

module.exports = mongoose.model("Thread", ThreadSchema);