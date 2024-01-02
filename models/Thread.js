const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    }
}, {
    timestamps: true
});


ThreadSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.delete_password = await bcrypt.hash(this.delete_password, salt);
});

ThreadSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.delete_password);
    return isMatch;
};

module.exports = mongoose.model("Thread", ThreadSchema);