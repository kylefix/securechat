import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ChatRoom from './ChatRoom'
import { Link } from 'react-router-dom'

export default class ChatContainer extends Component {
  state = {
    messages: {
      '0': []
    },
    token: null,
    intervalId: null,
    chatroomID: '0'
  }

  static contextTypes = {
    router: PropTypes.object
  }

  componentDidMount () {
    const token = window.localStorage.getItem('token')
    if (token) {
      const id = setInterval(
        () => this.pollMessages(this.state.chatroomID)
        , 1000)
      console.log(`Setting token: ${token}`)
      return this.setState({intervalId: id, token})
    }

    this.context.router.history.push('/login')
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  pollMessages = async chatroomID => {
    const {token} = this.state
    if (!token) return

    try {
      const messages = JSON.parse(await (
        await window.fetch(
          `/api/poll?token=${token}&&room=${chatroomID}`
        )
      ).text())

      this.setState({
        messages: {
          ...this.state.messages,
          [chatroomID]: messages
        }
      })
    } catch (e) {
      console.log(`Error fetching messages!: ${e}`)
      this.context.router.history.push('/login')
    }
  }

  sendMessage = (message, chatroomID) => {
    const {messages, token} = this.state

    window.fetch(
      `/api/send?token=${token}&&room=${chatroomID}`,
      { method: 'POST',
        body: message }
    ).catch(e => console.log(`Error sending message!: ${e}`))

    this.setState({
      ...messages,
      [chatroomID]: messages[chatroomID].concat(message)
    })
  }

  render () {
    return (
      <div>
        <Link to='/createAccount'>Create Account</Link>
        <ChatRoom
          chatroomID='0'
          messages={this.state.messages['0'] || []}
          onSendMessage={this.sendMessage}
        />
      </div>
    )
  }
}
