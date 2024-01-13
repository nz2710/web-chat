import MessageModel from "../models/messageModel.js";

export const addMessage = async (req, res) => {
  const { roomId, senderId, text, sender, image } = req.body;
  const message = new MessageModel({
    roomId,
    senderId,
    text,
    sender,
    image
  });
  try {
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await MessageModel.aggregate([
      { $match: { roomId: roomId } },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'sender',
        },
      }, {
        $unwind: {
          path: "$sender"
        }
      },
      {
        $project: {
          roomId: 1,
          senderId: 1,
          text: 1,
          image: 1,
          sender: {
            firstname: 1,
            lastname: 1,
            profilePicture: 1,
            rooms: 1,
          },
          createdAt: 1,
          updatedAt: 1,
        }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};
