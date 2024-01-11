const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ReplySchema = new mongoose.Schema({
    thread_id: {
        type: mongoose.Types.ObjectId,
        ref: "Thread",
        required: [true, "Reply must be made in a thread"]
    },
    delete_password: {
        type: String,
        required: [true, "Password for reply must be provided"]
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
    }
}, {
    // timestamps: true
});
/*
ReplySchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.delete_password = await bcrypt.hash(this.delete_password, salt);
});

ReplySchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.delete_password);
    return isMatch;
};
  */
module.exports = mongoose.model("Reply", ReplySchema);