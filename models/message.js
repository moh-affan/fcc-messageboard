let mongoose = require("mongoose");
//let mongodb = require("mongodb");

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

let messageSchema = new mongoose.Schema({
  board: String,
  text: String,
  created_on: {
    type: Date,
    default: undefined, // Prevents auto-setting of Date.now
  },
  bumped_on: {
    type: Date,
    default: undefined, // Prevents auto-setting of Date.now
  },
  reported: Boolean,
  delete_password: String,
  replies: [
    {
      text: String,
      created_on: {
        type: Date,
        default: undefined, // Prevents auto-setting of Date.now
      },
      delete_password: String,
      reported: Boolean
    }
  ]
});

let Message = mongoose.model("message", messageSchema);

exports.Message = Message;