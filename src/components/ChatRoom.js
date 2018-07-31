import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Form from './Form'
import Input from './Input'
import Submit from './Submit'
import MessageList from './MessageList'
import Message from './Message'

class ChatRoom extends Component {
  state = {
    messageInput: '',
    intervalId: ''
  }

  static propTypes = {
    chatroomID: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
    onSendMessage: PropTypes.func.isRequired
  }

  handleNewMessage = () => {
    this.props.onSendMessage(this.state.messageInput, this.props.chatroomID)
    this.setState({messageInput: ''})
  }

  handleChangeMessage = e => {
    this.setState({messageInput: e.target.value})
  }

  render () {
    return (
      <main className='ChatRoom'>
        <MessageList
          of={(content, key) =>
            <Message content={content} key={key} />}
          messages={this.props.messages}
        />
        <Form onSubmit={this.handleNewMessage} >
          <Input
            value={this.state.messageInput}
            onChange={this.handleChangeMessage}
          />
          <Submit />
        </Form>
      </main>
    )
  }
}

export default ChatRoom
