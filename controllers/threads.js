const Thread = require("../models/Thread");
const Reply = require("../models/Reply");

const createThread = async (req, res) => {
    const date = new Date();
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
        created_on: newThread.created_on,
        bumped_on: newThread.bumped_on,
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
            bumped_on: -1
        })
        .limit(10);

    const threadsWithReplies = await Promise.all(
        threads.map(async (thread) => {
            const replies = await Reply.find({
                    thread_id: thread._id
                })
                .sort({
                    created_on: -1
                })
                .limit(3);
            return {
                _id: thread._id,
                text: thread.text,
                created_on: thread.created_on,
                bumped_on: thread.bumped_on,
                replies: replies.map((reply) => ({
                    _id: reply._id,
                    text: reply.text,
                    created_on: reply.created_on,
                })),
                replycount: replies.length,
                board: thread.board,
            };
        })
    );

    return res.send(threadsWithReplies);
    // return res.redirect(`/b/${board}/`);
};

// Отправить DELETE запрос на /api/threads/{board} с thread_id и delete_password.
// Вернуть "incorrect password" или "success".

const deleteThread = async (req, res) => {
    try {
        let thread = await Thread.findOne({
            _id: req.body.thread_id
        });

        if (!thread) {
            return;
        }

        if (thread.delete_password == req.body.delete_password) {
            // Удаляем все связанные с темой ответы
            await Reply.deleteMany({
                thread_id: req.body.thread_id
            });

            // Удаляем саму тему
            await Thread.deleteOne({
                _id: req.body.thread_id
            });

            return res.send("success");
        }

        console.log(thread)
        return res.send("incorrect password");
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error'
        });
    }
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
    console.log(thread)
    return res.send("reported");
};

module.exports = {
    createThread,
    getThreads,
    deleteThread,
    reportThread
};