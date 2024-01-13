import RoomModel from "../models/roomModel.js";

export const getRoom = async (req, res) => {
    try {
        const { freeWord } = req.query;
        let queryString = {};

        if (freeWord) {
            queryString = {
                title: {
                    $regex: req.query.freeWord, $options: 'i'
                }
            }
        };

        queryString = {
            ...queryString,
            members: { $in: [req.params.id] },
        };
        console.log(queryString)
        const rooms = await RoomModel.find(queryString);

        res.status(200).json(rooms)
    } catch (error) {
        res.status(500).json(error)
    }
};

export const findRoom = async (req, res) => {
    try {
        const body = req.body;
        const queryString = {
            members: { $all: body.members, $size: 2 },
            type: 'single'
        };
        const room = await RoomModel.findOne(queryString);
        if (room) {
            res.status(200).json(room)
        } else {
            res.status(200).json({})
        }
    } catch (error) {
        res.status(500).json(error)
    }
};

export const createRoom = async (req, res) => {
    const body = req.body;

    const newChat = new RoomModel({
        title: body.title,
        image: body.image,
        members: body.members,
        type: body.type,
        description: body.description,
    });

    try {
        const result = await newChat.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updateRoom = async (req, res) => {
    try {
        const body = req.body;
        const room = await RoomModel.findOne({_id: req.params.id});
        console.log(room)
        if (room.type === 'multiple') {
            await room.update({
                title: body.title,
                image: body.image,
                description: body.description,
                members: body.members,
            });
            let result = await RoomModel.findOne({_id: req.params.id});
            res.status(200).json(result);
        } else {
            res.status(500).json(error);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};
