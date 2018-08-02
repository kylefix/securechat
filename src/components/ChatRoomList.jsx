import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Loading = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`
const Tr = props => <tr {...props} />

class ChatRoomList extends Component {
  state = {
    rooms: [],
    intervalId: null,
    loading: true
  }

  static propTypes = {
    onChangeRoom: PropTypes.func.isRequired,
    roomId: PropTypes.string.isRequired
  }

  async componentDidMount () {
    this.setState({
      intervalId: setInterval(this.getRoomList, 1000)
    })
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  getRoomList = async () => {
    const roomList = await (await window.fetch(
      `/api/listRooms`
    )).text()

    this.setState({
      rooms: JSON.parse(roomList),
      loading: false
    })
  }

  handleChangeRoom = (id, isPublic) => {
    let password
    if (!isPublic) {
      password = window.prompt(
        'REFACTOR: This room is private, please enter the password'
      )
    }
    this.props.onChangeRoom(id, password)
  }

  renderLoading () {
    window.componentHandler.upgradeAllRegistered()

    return (
      <Loading>
        <div className='mdl-spinner mdl-js-spinner is-active' />
      </Loading>
    )
  }

  renderRoom = (room, index) => {
    return (
      <Tr
        key={index}
        onClick={
          this.props.roomId === room.id
            ? function noop () {}
            : () => this.handleChangeRoom(room.id, room.public)
        }
      >
        <td className='mdl-data-table__cell--non-numeric'>
          {room.name}
        </td>
        <td>Users: {room.users.length}</td>
      </Tr>
    )
  }

  render () {
    if (this.state.loading) return this.renderLoading()

    return (
      <table className='mdl-data-table mdl-js-data-table mdl-shadow--2dp'>
        <thead>
          <tr style={{backgroundColor: 'rgba(144, 202, 249, 1)'}}>
            <th className='mdl-data-table__cell--non-numeric'>Room Names</th>
            <th>Users Online</th>
          </tr>
        </thead>
        <tbody>
          {this.state.rooms.map(this.renderRoom)}
        </tbody>
      </table>
    )
  }
}

export default ChatRoomList
