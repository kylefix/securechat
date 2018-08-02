import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import ChatRoom from './ChatRoom'

const Loading = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`

export default class ChatContainer extends Component {
  state = {
    messages: [],
    intervalId: null,
    loading: true
  }

  static propTypes = {
    chatRoomId: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object
  }

  async componentDidMount () {
    const {chatRoomId} = this.props
    const id = setInterval(
      () => this.pollMessages(chatRoomId)
      , 200)

    return this.setState({intervalId: id})
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  pollMessages = async chatRoomId => {
    try {
      const response = await window.fetch(
        `/api/poll?room=${chatRoomId}`,
        {
          method: 'GET',
          credentials: 'same-origin'
        }
      )

      if (response.status !== 200) return this.props.onKick()

      const messages = JSON.parse(await response.text())

      this.setState({
        messages,
        loading: false
      })
    } catch (e) {
      // this.context.router.history.push('/login')
    }
  }

  sendMessage = (message, chatRoomId) => {
    window.fetch(
      `/api/send?room=${chatRoomId}`,
      { method: 'POST',
        body: message,
        credentials: 'same-origin'}
    ).catch(e => console.log(`Error sending message!: ${e}`))
  }

  renderLoading () {
    window.componentHandler.upgradeAllRegistered()

    return (
      <Loading>
        <div className='mdl-spinner mdl-js-spinner is-active' />
      </Loading>
    )
  }

  render () {
    if (this.state.loading) return this.renderLoading()

    return (
      <div>
        <ChatRoom
          chatRoomId={this.props.chatRoomId}
          messages={this.state.messages || []}
          onSendMessage={this.sendMessage}
        />
      </div>
    )
  }
}
