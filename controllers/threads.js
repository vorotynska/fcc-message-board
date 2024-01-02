const Thread = require("../models/Thread");
const Reply = require("../models/Reply");
/*
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
/*
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
}; */

const createThread = async (req, res) => {
    req.body.board = req.params.board;
    // const board = req.params.board;
    const newThread = await Thread.create(req.body);
    if (!newThread) {
        return res.json({
            error: "Couldn't create new thread"
        });
    }
    const rep = {
        _id: newThread._id,
        text: newThread.text,
        created_on: newThread.createdAt,
        bumped_on: newThread.updatedAt,
        delete_password: newThread.delete_password,
        replies: [],
        replycount: 0,
        board: req.params.board
    };
    return res.send(rep);

};

// Вернуть массив последних 10 bumped тредов.
// Каждый тред должен содержать только последние 3 ответа.
const getThreads = async (req, res) => {
    const board = req.params.board;
    const threads = await Thread.find({
            board: board
        })
        .sort({
            updatedAt: -1
        })
        .limit(10);

    const threadsWithReplies = await Promise.all(
        threads.map(async (thread) => {
            const replies = await Reply.find({
                    thread_id: thread._id
                })
                .sort({
                    createdAt: -1
                })
                .limit(3);
            return {
                _id: thread._id,
                text: thread.text,
                created_on: thread.createdAt,
                bumped_on: thread.updatedAt,
                replies: replies.map((reply) => ({
                    _id: reply._id,
                    text: reply.text,
                    created_on: reply.createdAt,
                })),
                replycount: replies.length,
                board: thread.board,
            };
        })
    );

    return res.send(threadsWithReplies);
};

// Отправить DELETE запрос на /api/threads/{board} с thread_id и delete_password.
// Вернуть "incorrect password" или "success".
const deleteThread = async (req, res) => {
    const thread = await Thread.findOne({
        _id: req.body.thread_id
    });
    if (!thread) {
        return res.send("success");
    }
    if (!(await thread.comparePassword(req.body.delete_password))) {
        return res.send("incorrect password");
    }
    await Thread.deleteOne({
        _id: req.body.thread_id
    });
    await Reply.deleteMany({
        thread_id: req.body.thread_id
    });
    return res.send("success");
};

//Отправить PUT запрос на /api/threads/{board} с report_id.
//Вернуть "success".
const reportThread = async (req, res) => {
    const thread = await Thread.findOneAndUpdate({
        _id: req.body.thread_id
    }, {
        reported: true
    });
    if (!thread) {
        return res.send("reported");
    }
    return res.send("reported");
};

module.exports = {
    createThread,
    getThreads,
    deleteThread,
    reportThread
};