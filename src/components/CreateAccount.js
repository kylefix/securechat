import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Input from './Input'
import Form from './Form'
import Submit from './Submit'

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
        body: JSON.stringify(body)
      })
    )

    if (response.status === 200) {
      window.localStorage.setItem('token', await response.text())
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
      <Form onSubmit={this.handleCreateAccount} >
        <Input
          value={this.state.usernameInput}
          onChange={this.handleChangeUsername}
        />
        <Input
          value={this.state.passwordInput}
          onChange={this.handleChangePassword}
        />
        <Submit />
      </Form>
    )
  }
}

export default CreateAccount
