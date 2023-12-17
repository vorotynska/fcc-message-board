const Reply = require("../models/Reply");
const Thread = require("../models/Thread");

const createReply = async (req, res) => {
    const reply = await Reply.create(req.body);
    if (!reply) {
        return res.send("could not post reply");
    }
    const thread = await Thread.findOneAndUpdate({
        _id: reply.thread_id
    }, {
        updatedAt: reply.updatedAt
    });
    if (!thread) {
        return res.send("could not bump thread");
    }
    return res.send(reply);
};

const getAllReplies = async (req, res) => {
    const threads = await Thread.find({
        board: req.params.board
    });

    // Find the replies that match the thread id's
    const replyObj = await Reply.find({
        thread_id: req.query.thread_id
    });

    if (!threads || !replyObj) {
        return res.json({
            error: "something went woring"
        });
    }

    // Merge the data from the two calls to the DB into one 'rep'-ly/response
    var rep = threads.map((t) => {
        return {
            _id: t._doc._id,
            text: t._doc.text,
            created_on: t._doc.updatedAt,
            replies: replyObj
                .filter((o) => {
                    return o.thread_id.toString() === t._doc._id.toString();
                })
                .map((o) => {
                    return {
                        _id: o._id,
                        text: o.text,
                        created_on: o.createdAt
                    };
                })
                .sort((a, b) =>
                    a.created_on.toString().localeCompare(b.created_on.toString())
                )
                .reverse(),
            replycount: replyObj.filter((o) => {
                return o.thread_id.toString() === t._doc._id.toString();
            }).length
        };
    });
    var repFind = rep.find(({
        _id
    }) => _id.toString() === req.query.thread_id);
    //console.log(repFind)
    return res.send(repFind);
};

const deleteReply = async (req, res) => {
    const reply = await Reply.findOne({
        _id: req.body.reply_id
    });
    if (!reply) {
        return res.send("something went wrong");
    }
    if (!(await reply.comparePassword(req.body.delete_password))) {
        return res.send("wrong password");
    }
    await Reply.deleteOne({
        _id: req.body.reply_id
    });
    return res.send("success");
};

const reportReply = async (req, res) => {
    const reply = await Reply.findOneAndUpdate({
        _id: req.body.reply_id
    }, {
        reported: true
    });
    if (!reply) {
        return res.send("something went wrong");
    }
    return res.send("success");
};

module.exports = {
    createReply,
    getAllReplies,
    deleteReply,
    reportReply
};