import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Form from './Form'
import Input from './Input'
import Submit from './Submit'
import MessageList from './MessageList'
import Message from './Message'

const Container = styled.main`
  margin-right: 1em;
`
const StyledList = styled.div`
  min-height: 100%;
  padding: 1em;
  border: 1px lightgrey solid;
`

class ChatRoom extends Component {
  state = {
    messageInput: '',
    intervalId: ''
  }

  static propTypes = {
    chatRoomId: PropTypes.string.isRequired,
    messages: PropTypes.array.isRequired,
    onSendMessage: PropTypes.func.isRequired
  }

  handleNewMessage = () => {
    this.props.onSendMessage(this.state.messageInput, this.props.chatRoomId)
    this.setState({messageInput: ''})
  }

  handleChangeMessage = e => {
    this.setState({messageInput: e.target.value})
  }

  render () {
    return (
      <Container>
        <StyledList>
          <MessageList
            of={(content, key) =>
              <Message content={content} key={key} />}
            messages={this.props.messages}
          />
        </StyledList>
        <Form onSubmit={this.handleNewMessage} >
          <Input
            label='Enter your message'
            value={this.state.messageInput}
            onChange={this.handleChangeMessage}
          />
          <Submit />
        </Form>
      </Container>
    )
  }
}

export default ChatRoom
