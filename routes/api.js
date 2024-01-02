const express = require("express");
const router = express.Router();
const {
  createReply,
  deleteReply,
  reportReply,
  getAllReplies
} = require("../controllers/replies");
const {
  createThread,
  getThreads,
  deleteThread,
  reportThread
} = require("../controllers/threads");

router
  .route("/threads/:board")
  .get(getThreads)
  .post(createThread)
  .put(reportThread)
  .delete(deleteThread);

router
  .route("/replies/:board")
  .get(getAllReplies)
  .post(createReply)
  .put(reportReply)
  .delete(deleteReply);

module.exports = router;