const mongoose = require("mongoose");
const Reply = require("../models/Reply");
const Thread = require("../models/Thread");

// POST Request
// thread_idbumped_onreplies_idtextcreated_ondelete_passwordreported

const createReply = async (req, res) => {
    const date = new Date();
    const board = req.params.board;

    if (!req.body.thread_id || !req.body.text || !req.body.delete_password) {
        return res.json({
            error: 'Thread ID, Text, and Delete password are required'
        });
    }

    const {
        thread_id,
        text,
        delete_password
    } = req.body;

    try {
        const reply = await Reply.create({
            thread_id: thread_id,
            text: text,
            delete_password: delete_password,
            created_on: date,
            reported: false
        });

        if (!reply) {
            return res.send("Could not post reply");
        }
        //const thread = await Thread.findById(thread_id);
        const thread = await Thread.findByIdAndUpdate(
            thread_id, {
                $set: {
                    bumped_on: date,
                },
                $push: {
                    replies: {
                        $each: [reply],
                        $position: 0
                    }
                }
            }, {
                new: true
            }
        );

        if (!thread) {
            return res.send("Could not bump thread");
        }

        await thread.save();
        return res.send(reply);
        // return res.redirect(`/b/${board}/${thread_id}`);
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};

// GET Request:

const getAllReplies = async (req, res) => {

    const thread = await Thread.findById(req.query.thread_id);
    if (!thread) {
        throw new Error("Thread not found");
    }

    const replies = await Reply.find({
        thread_id: thread._id
    });

    const response = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: replies.map(reply => ({
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on,
        })),
        replycount: replies.length,
        board: thread.board,
    };

    return res.json(response);
}

const deleteReply = async (req, res) => {

    const reply = await Reply.findById(req.body.reply_id);
    if (!reply) {
        return res.send("success");
    }

    if (reply.delete_password !== req.body.delete_password) {
        return res.send("incorrect password")
    }

    await Reply.findByIdAndUpdate(req.body.reply_id, {
        text: "[deleted]"
    });
    return res.send("success");
}

const reportReply = async (req, res) => {
    const reply = await Reply.findOneAndUpdate({
        _id: req.body.reply_id
    }, {
        reported: true
    }, {
        new: true
    });
    if (!reply) {
        return res.send("something went wrong");
    }
    return res.send("reported");
};

module.exports = {
    createReply,
    getAllReplies,
    deleteReply,
    reportReply
};