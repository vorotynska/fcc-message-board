const Reply = require("../models/Reply");
const Thread = require("../models/Thread");

/*const createReply = async (req, res) => {
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
}; */

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
        const thread = await Thread.findById(thread_id);
        /*  const thread = await Thread.findByIdAndUpdate(
              thread_id, {
                  $set: {
                      updatedAt: date,
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
          );  */

        if (!thread) {
            return res.send("Could not bump thread");
        }

        if (!thread.updatedAt || reply.created_on > thread.updatedAt) {
            thread.updatedAt = reply.created_on;
        }

        thread.replies.unshift(reply);
        await thread.save();

        return res.redirect(`/b/${board}/${thread_id}`);
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
        created_on: thread.updatedAt,
        bumped_on: thread.updatedAt,
        replies: replies.map(reply => ({
            _id: reply._id,
            text: reply.text,
            created_on: reply.createdAt,
        })),
        replycount: replies.length,
        board: thread.board,
    };

    return res.json(response);
}

const deleteReply = async (req, res) => {

    const reply = await Reply.findById(req.body.reply_id);
    if (!reply) {
        throw new Error("Reply not found");
    }

    if (!(await reply.comparePassword(req.body.delete_password))) {
        return res.send("wrong password");
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