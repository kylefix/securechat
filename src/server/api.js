const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const env = require('./.env.js')

const app = express()
app.use(bodyParser.raw({type: '*/*'}))

const getDb = () => {
  const mongodb = env.DB
  mongoose.connect(mongodb, { useNewUrlParser: true })
  mongoose.Promise = global.Promise
  return mongoose.connection
}

const getModel = (name, schema) =>
  mongoose.model(name, new Schema(schema))

// ============================================================

const ChatRoom = getModel('ChatRoom', {
  id: String,
  name: String,
  messages: Array,
  users: Array,
  public: Boolean,
  password: String
})

const ChatRoomUser = getModel('ChatRoomUser', {
  userId: String,
  lastPolled: String,
  lastMessage: String,
  roomId: String
})

const Message = getModel('Message', {
  content: String,
  username: String,
  broadcast: Boolean
})

const Token = getModel('Token', {
  token: String,
  userId: String
})

const User = getModel('User', {
  username: String,
  password: String,
  permissions: Array,
})

const db = getDb()

// ============================================================

const parseQuery = async (token, room, password) => {
  const UNAUTHORIZED = {status: 401}
  const DO_LOGIN = {status: 402}

  const {userId} = (await getUserIdfromToken(token) || {})
  if (!userId) return DO_LOGIN

  const chatRoom = await ChatRoom.findOne({id: room})
  if (!chatRoom) return UNAUTHORIZED
  if (!(await hasJoined(userId, chatRoom._id)) &&
    !(await isPermitted(userId, room, password))) {
    return UNAUTHORIZED
  }

  const {username} = await getUsernameFromUserId(userId)

  return {
    status: 200,
    userId,
    chatRoom,
    username
  }
}

const getNewToken = async userId => {
  const token = (~~(Math.random() * 10000000)).toString()
  await Token.deleteMany({userId: userId})
  await (new Token({token, userId: userId})).save()

  return token
}

const getUsernameFromUserId = async userId =>
  User.findById(userId).select('username')

const getUserIdfromToken = async token =>
  Token.findOne({token}).select('userId')

const hasJoined = async (userId, roomId) =>
  !!(await ChatRoomUser.findOne({userId, roomId}))

const isPermitted = async (userId, chatroomId, password) => {
  const chatRoom = await ChatRoom.findOne({id: chatroomId}).select('public password')

  return chatRoom.public
    ? true
    : chatRoom.password === password
}

// ============================================================

app.post('/api/send', async (req, res, next) => {
  try {
    const token = req.headers.cookie
    const {room} = req.query
    const message = req.body.toString()

    if (!token || !room) return res.send('Missing Parameters!')

    const {userId} = (await getUserIdfromToken(token)) || {}
    if (!userId) return res.sendStatus(402)

    if (!hasJoined(userId, room)) {
      return res.send(401)
    }

    const {username} = await getUsernameFromUserId(userId)

    const newMessage = {
      username,
      content: message
    }
    const {_id} = await new Message(newMessage).save()

    const chatRoom = await ChatRoom.findOne({id: room})
    if (!chatRoom) return res.sendStatus(404)

    const chatRoomUser = await ChatRoomUser.findOne({
      userId,
      roomId: chatRoom._id
    })

    if (!chatRoomUser) res.sendStatus(401)
    chatRoomUser.lastMessage = (Date.now()).toString()
    await chatRoomUser.save()

    chatRoom.messages.push(_id)
    await chatRoom.save()

    return res.sendStatus(200)
  } catch (e) {
    next(e)
  }
})

app.post('/api/createRoom', async (req, res, next) => {
  try {
    const {name, password} = JSON.parse(req.body.toString())
    const isPublic = !password
    const id = await ChatRoom.count({})

    const newChatRoom = {
      id,
      name,
      password: password || '',
      public: isPublic,
      messages: [],
      users: []
    }
    console.log(newChatRoom)

    await (new ChatRoom(newChatRoom)).save()
    res.sendStatus(200)
  } catch (e) {
    next(e)
  }
})

app.post('/api/join', async (req, res, next) => {
  try {
    const token = req.headers.cookie
    console.log(token)
    const {room} = req.query
    const {password} = JSON.parse(req.body)
    const {
      status,
      userId,
      chatRoom,
      username
    } = await parseQuery(token, room, password)

    if (status === 402) return res.sendStatus(402)
    if (status !== 200) return res.sendStatus(status)

    const {_id} = await new Message({
      broadcast: true,
      content: `${username} has joined!`
    }).save()

    const chatRoomUser = await new ChatRoomUser({
      userId,
      lastPolled: (Date.now()).toString(),
      lastMessage: (Date.now()).toString(),
      roomId: chatRoom._id
    }).save()

    chatRoom.messages.push(_id)
    chatRoom.users.push(chatRoomUser._id)
    await chatRoom.save()

    return res.sendStatus(200)
  } catch (e) {
    next(e)
  }
})

app.get('/api/poll', async (req, res, next) => {
  try {
    const token = req.headers.cookie
    const {room} = req.query
    const {
      status,
      userId,
      chatRoom
    } = await parseQuery(token, room)

    if (status !== 200) return res.sendStatus(status)

    if (!hasJoined(userId, room)) {
      return res.send(401)
    }

    const chatRoomUser = await ChatRoomUser.findOne({
      userId,
      roomId: chatRoom._id
    })

    if (!chatRoomUser) return res.sendStatus(401)

    chatRoomUser.lastPolled = (Date.now()).toString()
    await chatRoomUser.save()

    const chatHistory =
      await Message
        .find({
          _id: {$in: chatRoom.messages}
        })
        .select('broadcast content username -_id')

    res.send(JSON.stringify(chatHistory.slice(-10)))
  } catch (e) {
    next(e)
  }
})

app.get('/api/listRooms', async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom
      .find({})
      .select('id name users public -_id')

    res.send(JSON.stringify(chatRooms))
  } catch (e) {
    next(e)
  }
})

app.get('/api/roomInfo', async (req, res, next) => {
  try {
    const {room} = req.query
    const chatRoom =
      await ChatRoom
        .findOne({id: room})
        .select('id name users')

    if (!chatRoom) res.sendStatus(404)
    const users = await Promise.all(chatRoom.users.map(async chatId => {
      const {userId} = await ChatRoomUser.findById(chatId)
      const {username} = await User.findById(userId).select('username')

      return {
        username
      }
    }))

    res.send({
      roomId: chatRoom.id,
      name: chatRoom.name,
      users
    })
  } catch (e) {
    next(e)
  }
})

app.post('/api/create', async (req, res, next) => {
  try {
    const {username, password} = JSON.parse(req.body)
    const newUser = {
      username,
      password,
      permissions: ['0']
    }

    const user = await (new User(newUser)).save()

    res.set('Set-Cookie', await getNewToken(user._id))
    return res.sendStatus(200)
  } catch (e) {
    next(e)
  }
})

app.post('/api/login', async (req, res, next) => {
  try {
    const token = req.headers.cookie

    if (token) {
      const {userId} = (await getUserIdfromToken(token)) || {}
      if (userId) return res.sendStatus(200)
    }

    if (!req.body) return res.sendStatus(402)

    let parsed
    try {
      parsed = JSON.parse(req.body)
    } catch (e) {
      return res.sendStatus(402)
    }
    const {username, password} = parsed
    const user = await User.findOne({username, password})

    if (!user || !user._id) return res.sendStatus(401)

    res.set('Set-Cookie', await getNewToken(user._id))
    return res.sendStatus(200)
  } catch (e) {
    next(e)
  }
})

const cleanUp = async () => {
  const chatRoomUsers = await ChatRoomUser.find()
  const fiveMinutes = 1 * 60 * 1000

  for (const chatRoomUser of chatRoomUsers) {
    const {lastMessage, lastPolled, roomId, userId, _id} = chatRoomUser
    const shouldDelete =
      +lastMessage + fiveMinutes < Date.now() ||
        +lastPolled + 500 < Date.now()

    if (shouldDelete) {
      await ChatRoomUser.findByIdAndRemove(_id)

      const {username} = await getUsernameFromUserId(userId)

      const {_id: messageId} = await new Message({
        broadcast: true,
        content: `${username} has left!`
      }).save()

      const update = {
        $pull: { 'users': _id },
        $push: { 'messages': messageId }
      }

      await ChatRoom.findByIdAndUpdate(roomId, update)
    }
  }
}

setInterval(cleanUp, 200)

app.listen(4000)
