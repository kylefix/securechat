import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Input from './Input'
import Form from './Form'
import Submit from './Submit'

const Loading = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`

const StyledForm = styled.div`
  & form {
    margin: 2em;
    width: 300px;
    display: flex;
    flex-direction: column;
  }
`

class CreateRoom extends Component {
  state = {
    nameInput: '',
    passwordInput: '',
    loading: false
  }

  static contextTypes = {
    router: PropTypes.object
  }

  handleCreateAccount = async () => {
    const body = {
      name: this.state.nameInput,
      password: this.state.passwordInput
    }

    this.setState({loading: true})

    const response = await (
      await window.fetch('/api/createRoom', {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'same-origin'
      })
    )

    if (response.status === 200) {
      this.setState({loading: false})
      this.context.router.history.push('/')
    }
  }

  handleChangeName = e => this.setState({
    nameInput: e.target.value
  })

  handleChangePassword = e => this.setState({
    passwordInput: e.target.value
  })

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
      <StyledForm>
        <Form onSubmit={this.handleCreateAccount} >
          <Input
            label='Enter a room name'
            value={this.state.nameInput}
            onChange={this.handleChangeName}
          />
          <Input
            label='Enter a password or none if public'
            value={this.state.passwordInput}
            onChange={this.handleChangePassword}
          />
          <Submit />
        </Form>
      </StyledForm>
    )
  }
}

export default CreateRoom
