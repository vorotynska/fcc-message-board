const Thread = require("../models/Thread");
const Reply = require("../models/Reply");

const createThread = async (req, res) => {
    req.body.board = req.params.board;
    const newThread = await Thread.create(req.body);
    if (!newThread) {
        return res.json({
            error: "Coudln't create new thread"
        });
    }
    var rep = {
        bumped_on: newThread.updatedAt,
        replies: [],
        board: req.params.board,
        created_on: newThread.createdAt
    };
    return res.send({
        ...newThread._doc,
        ...rep
    });
};

/**
 * Get the 10 latest threads with at least 3 replies each.
 */
const getThreads = async (req, res) => {
    const board = req.params.board;
    const threads = await Thread.find({
        board: board
    });

    // Get the thread id's
    const threadIds = threads.map((t) => t._id);

    // Find the replies that match the thread id's
    const replyObj = await Reply.find({
        thread_id: {
            $in: threadIds
        }
    });

    // Merge the data from the two calls to the DB into one 'rep'-ly/response
    var rep = threads
        .map((t) => {
            return {
                _id: t._doc._id,
                text: t._doc.text,
                created_on: t._doc.updatedAt,
                bumped_on: t._doc.updatedAt,
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
                    .sort((a, b) => a.created_on - b.created_on),
                replycount: replyObj.filter((o) => {
                    return o.thread_id.toString() === t._doc._id.toString();
                }).length
            };
        })
        .sort((a, b) => a.created_on - b.created_on);

    rep = rep.slice(-10).reverse(); // Latest thread on top
    for (var r of rep) {
        r.replies = r.replies.slice(-3).reverse(); // Latest reply on top
    }
    return res.send(rep);
};

const deleteThread = async (req, res) => {
    const thread = await Thread.findOne({
        _id: req.body.thread_id
    });
    if (!thread) {
        return res.send("something went wrong");
    }
    if (!(await thread.comparePassword(req.body.delete_password))) {
        return res.send("wrong password");
    }
    await Thread.deleteOne({
        _id: req.body.thread_id
    });
    await Reply.deleteMany({
        thread_id: req.body.thread_id
    });
    return res.send("success");
};

const reportThread = async (req, res) => {
    const thread = await Thread.findOneAndUpdate({
        _id: req.body.report_id
    }, {
        reported: true
    });
    if (!thread) {
        return res.send("something went wrong");
    }
    return res.send("success");
};

module.exports = {
    createThread,
    getThreads,
    deleteThread,
    reportThread
};