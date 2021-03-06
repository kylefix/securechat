import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Input from './Input'
import Form from './Form'
import Submit from './Submit'

const StyledForm = styled.div`
  & form {
    margin: 2em;
    width: 300px;
    display: flex;
    flex-direction: column;
  }
`

class CreateAccount extends Component {
  state = {
    usernameInput: '',
    passwordInput: '',
    loading: false
  }

  static contextTypes = {
    router: PropTypes.object
  }

  handleCreateAccount = async () => {
    const body = {
      username: this.state.usernameInput,
      password: this.state.passwordInput
    }

    this.setState({loading: true})

    const response = await (
      await window.fetch('/api/create', {
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

  handleChangeUsername = e => this.setState({
    usernameInput: e.target.value
  })

  handleChangePassword = e => this.setState({
    passwordInput: e.target.value
  })

  renderLoading () {
    return <div>Submitting...</div>
  }

  render () {
    if (this.state.loading) return this.renderLoading()

    return (
      <StyledForm>
        <Form onSubmit={this.handleCreateAccount} >
          <Input
            label='Enter a username'
            value={this.state.usernameInput}
            onChange={this.handleChangeUsername}
          />
          <Input
            label='Enter a password'
            value={this.state.passwordInput}
            onChange={this.handleChangePassword}
          />
          <Submit />
        </Form>
      </StyledForm>
    )
  }
}

export default CreateAccount
