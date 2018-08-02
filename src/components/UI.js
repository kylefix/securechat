import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import ChatContainer from './ChatContainer'
import ChatRoomList from './ChatRoomList'

const Container = styled.div`
  padding-top: 4em;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  justify-content: center;
`

const StyledChatContainer = styled.div`
  display: flex;
  justify-content: center;
  grid-column: 2;
  align-self: flex-start;
`

const StyledHeading = styled.h5`
`

const StyledChatList = styled.div`
  margin: 0 auto;
  grid-column: 1
  grid-row: 1;
`

export default class UI extends Component {
  state = {
    chatRoomId: ''
  }

  static contextTypes = {
    router: PropTypes.object
  }

  async componentDidMount () {
    const response = await window.fetch(
      `/api/login`,
      {
        method: 'POST',
        credentials: 'same-origin'
      }
    )

    if (response.status === 402) {
      return this.context.router.history.push('/login')
    }
  }

  handleChangeRoom = async (id, password) => {
    const response = await window.fetch(
      `/api/join?room=${id}`,
      {
        method: 'POST',
        body: JSON.stringify({password}),
        credentials: 'same-origin'
      }
    )

    if (response.status === 401) {
      // fix this
      return this.context.router.history.push('/')
    }

    return this.setState({chatRoomId: id})
  }

  onKick = () => {
    this.setState({chatRoomId: ''})
  }

  render () {
    const {chatRoomId} = this.state
    return (
      <Container>
        <StyledChatContainer>
          {chatRoomId !== ''
            ? (<ChatContainer
              onKick={this.onKick}
              key={chatRoomId}
              chatRoomId={chatRoomId}
            />)
            : <StyledHeading>Please Select A Chatroom</StyledHeading>}
        </StyledChatContainer>
        <StyledChatList>
          <ChatRoomList
            roomId={this.state.chatRoomId || ''}
            onChangeRoom={this.handleChangeRoom}
          />
        </StyledChatList>
      </Container>
    )
  }
}
