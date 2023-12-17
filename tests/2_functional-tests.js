const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Thread = require("../models/Thread");
const Reply = require("../models/Reply");
const bcrypt = require("bcrypt");
//const thread = require('../controllers/thread');
//const reply = require('../controllers/replies');

chai.use(chaiHttp);

suite("Functional Tests", function () {
  var randomThreadId2;
  suite("Thread tests", () => {
    var randomThreadId;
    // Populate the DB with 11 threads and 5 replies in each.
    before(async () => {
      var threads = [];
      for (let i = 0; i < 12; i++) {
        threads.push({
          board: "test",
          delete_password: "1234",
          text: "test text in thread"
        });
      }
      const tt = await Thread.insertMany(threads); // UNSAFE: passwords NOT hashed
      var replies = [];
      for (let t of tt) {
        for (let i = 0; i < 5; i++) {
          replies.push({
            thread_id: t._doc._id,
            delete_password: "1234",
            text: "test text in reply"
          });
        }
      }
      randomThreadId2 = tt[0]._id.toString(); // Used in PUT test
      await Reply.insertMany(replies); // UNSAFE: passwords NOT hashed
    });

    test("Test POST /api/threads/:board to create a new thread", (done) => {
      chai
        .request(server)
        .post("/api/threads/test2")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          text: "test2",
          delete_password: "1234"
        })
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            assert.equal(res.status, 200);
            assert.property(
              res.body,
              "board",
              "Board parameter should be set in the URL"
            );
            assert.property(
              res.body,
              "text",
              "Text should be sent in the body"
            );
            assert.property(
              res.body,
              "delete_password",
              "Password to delete should be sent in the body"
            );
            randomThreadId = res.body._id; // Used in DELETE test
            done();
          }
        });
    });
    test("Test GET /api/threads/:board to get the 10 most recent replies with 3 replies", (done) => {
      chai
        .request(server)
        .get("/api/threads/test")
        .end((err, res) => {
          if (err) {
            done(err);
          } else {
            assert.equal(res.status, 200);
            assert.isArray(
              res.body,
              "Gotten value should be an array (of objects)"
            );
            let tlength = res.body.length;
            assert.isAtMost(
              tlength,
              10,
              "Length of returned array should not be more than 10"
            );
            for (let i of res.body) {
              assert.property(
                i,
                "replies",
                "Object should contain the property replies"
              );
              assert.isArray(i.replies, "the replies value should be an array");
              let rlength = i.replies.length;
              assert.isAtMost(
                rlength,
                3,
                "Length of the replies value array should not be more than 3"
              );
            }
            done();
          }
        });
    });

    test("Test DELETE /api/threads/:board with an invalid password", (done) => {
      chai
        .request(server)
        .delete("/api/threads/test2")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          thread_id: randomThreadId,
          delete_password: "123"
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "wrong password");
          done();
        });
    });

    test("Test DELETE /api/threads/:board with a correct password", (done) => {
      chai
        .request(server)
        .delete("/api/threads/test2")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          thread_id: randomThreadId,
          delete_password: "1234"
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });

    test("Test PUT /api/threads/:board by reporting a thread", (done) => {
      chai
        .request(server)
        .put("/api/threads/test")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          report_id: randomThreadId2
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });
  });

  suite("Reply tests", () => {
    var randomReplyId;
    var randomReplyId2;
    test("Test POST /api/replies/:board by creating a new reply", (done) => {
      chai
        .request(server)
        .post("/api/replies/test")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          thread_id: randomThreadId2,
          delete_password: "1234",
          text: "test reply text"
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.property(
            res.body,
            "_id",
            "Response should contain a thread_id property"
          );
          assert.property(
            res.body,
            "delete_password",
            "Response should contain a deleted_password property"
          );
          assert.property(
            res.body,
            "reported",
            "Response should contain a reported property"
          );
          assert.property(
            res.body,
            "text",
            "Response should contain a text property"
          );
          assert.property(
            res.body,
            "thread_id",
            "Response should contain a thread_id property"
          );
          assert.equal(
            res.body.text,
            "test reply text",
            'value of text property should equal "test reply text"'
          );
          randomReplyId = res.body._id; // Used in DELETE test
          done();
        });
    });

    test("Test GET /api/replies/:board by getting all replies to a thread", (done) => {
      chai
        .request(server)
        .get("/api/replies/test")
        .query({
          thread_id: randomThreadId2
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.property(
            res.body,
            "_id",
            "Response should contain an _id property"
          );
          assert.property(
            res.body,
            "text",
            "Response should contain a text property"
          );
          assert.property(
            res.body,
            "created_on",
            "Response should contain a created_on property"
          );
          assert.property(
            res.body,
            "replies",
            "Response should contain a replies property"
          );
          assert.property(
            res.body,
            "replycount",
            "Response should contain a replycount property"
          );
          assert.isArray(
            res.body.replies,
            "Value of replies property should be an array"
          );
          assert.isNumber(
            res.body.replycount,
            "Value of replycount property should be a number"
          );
          randomReplyId2 = res.body.replies[0]._id; // Used in PUT test.
          done();
        });
    });

    test("Test DELETE /api/replies/:board with an incorrect password", (done) => {
      chai
        .request(server)
        .delete("/api/replies/test")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          reply_id: randomReplyId,
          delete_password: "123"
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "wrong password");
          done();
        });
    });

    test("Test DELETE /api/replies/:board with a correct password", (done) => {
      chai
        .request(server)
        .delete("/api/replies/test")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          reply_id: randomReplyId,
          delete_password: "1234"
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, "success");
          done();
        });
    });

    test("Test PUT /api/replies/:board by reporting a reply", (done) => {
      chai
        .request(server)
        .put("/api/replies/test")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          reply_id: randomReplyId2
        })
        .end((err, res) => {
          if (err) done(err);
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});