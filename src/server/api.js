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

const ChatRoom = getModel('ChatRoom', {
  id: String,
  name: String,
  messages: Array
})

const Message = getModel('Message', {
  content: String,
  username: String
})

const Token = getModel('Token', {
  token: String,
  userId: String
})

const User = getModel('User', {
  username: String,
  password: String,
  permissions: Array
})

const db = getDb()

app.post('/api/send', async (req, res, next) => {
  try {
    const {token, room} = req.query
    const message = req.body.toString()

    if (!token || !room) return res.send('Missing Parameters!')

    const {userId} = await getUserfromToken(token)
    if (!userId) res.send(401)

    if (!isPermitted(userId, room)) {
      return res.send(401)
    }

    const {username} = (await User.findOne({_id: userId}) || {})
    const newMessage = {
      username,
      content: message
    }
    const {_id} = await (new Message(newMessage).save())

    const chatRoom = await ChatRoom.findOne({id: room})
    if (!chatRoom) return res.sendStatus(400)

    await chatRoom.messages.push(_id)
    chatRoom.save()
  } catch (e) {
    next(e)
  }
})

app.post('/api/createRoom', async (req, res, next) => {
  try {
    const {id, name} = JSON.parse(req.body.toString())
    const newChatRoom = {
      id,
      name,
      messages: []
    }

    await (new ChatRoom(newChatRoom)).save()
    res.send('')
  } catch (e) {
    next(e)
  }
})

app.get('/api/poll', async (req, res, next) => {
  try {
    const {token, room} = req.query
    if (!token || !room) return res.send('Missing Parameters!')

    const userId = await getUserfromToken(token)
    if (!userId) return res.sendStatus(401)

    if (!isPermitted(userId, room)) {
      return res.sendStatus(401)
    }

    const {messages} = (await ChatRoom.findOne({id: room}) || {messages: []})
    if (!messages.length) return res.send(JSON.stringify([]))

    const chatHistory = await Promise.all(messages.map(async (id) =>
      Message.findOne(id)
    ))
    const messageList = chatHistory.map(({content, username}) => (
      {content, username}
    ))

    res.send(JSON.stringify(messageList.length > 10
      ? messageList.slice(10)
      : messageList
    ))
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
    const token = await getNewToken(user._id)
    return res.send(token)
  } catch (e) {
    next(e)
  }
})

const getNewToken = async userId => {
  const token = (~~(Math.random() * 10000000)).toString()
  await Token.deleteMany({userId: userId})
  await (new Token({token, userId: userId})).save()
  return token
}

app.post('/api/login', async (req, res, next) => {
  try {
    const {username, password} = JSON.parse(req.body)
    const user = (await User.findOne({username, password}) || {})

    if (!user._id) return res.send(401)

    const token = await getNewToken(user._id)
    return res.send(token)
  } catch (e) {
    next(e)
  }
})

const getUserfromToken = async token => Token.findOne({token})

const isPermitted = async (userId, chatroomID) => {
  const {permissions} = (await User.findOne({_id: userId}) || {})

  return permissions
    ? permissions.includes(chatroomID)
    : false
}

app.listen(4000)
