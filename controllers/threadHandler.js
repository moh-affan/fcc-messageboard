let mongoose = require("mongoose");
let Message = require("../models/message").Message;

exports.postThread = async (req, res, next) => {
  try {
    let board = req.params.board;
    let timestamp = new Date();
    timestamp.setMilliseconds(0);
    timestamp.setSeconds(timestamp.getSeconds() + 0);
    console.log('timestamp', timestamp.toUTCString());

    let newThread = await Message.create({
      board: board,
      text: req.body.text,
      created_on: timestamp,
      bumped_on: timestamp,
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    });

    return res.redirect("/b/" + board);
  } catch (err) {
    return res.json("error");
  }
};

exports.getThread = async (req, res) => {
  try {
    let board = req.params.board;
    await Message.find({ board: board })
      .sort({ bumped_on: "desc" })
      .select("-reported -delete_password")
      .limit(10)
      .lean()
      .exec((err, threadArray) => {
        if (!err && threadArray) {
          threadArray.forEach(ele => {
            ele.replycount = ele.replies.length;

            ele.replies.sort((a, b) => {
              return b.created_on - a.created_on;
            });

            //limit replies to 3
            let replies = [];
            ele.replies.slice(0, 3).forEach(reply => {
              delete reply.delete_password;
              delete reply.reported;
              reply.created_on = ele.bumped_on;
              replies.push(reply);
            });
            ele.replies = replies;
          });
          console.log(JSON.stringify(threadArray));
          console.log(JSON.parse(JSON.stringify(threadArray)));
          return res.json(threadArray);
        }
      });
  } catch (err) {
    return res.json("error");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    let board = req.params.board;
    let deletedThread = await Message.findById(req.body.thread_id);
    if (req.body.delete_password === deletedThread.delete_password) {
      await deletedThread.delete();
      return res.send("success");
    } else {
      return res.send("incorrect password");
    }
  } catch (err) {
    res.json("error");
  }
};

exports.putThread = async (req, res) => {
  try {
    let updateThread = await Message.findById(req.body.thread_id);
    updateThread.reported = true;
    await updateThread.save();
    return res.send("reported");
  } catch (err) {
    res.json("error");
  }
};