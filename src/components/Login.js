import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import Input from './Input'
import Form from './Form'
import Submit from './Submit'

class Login extends Component {
  state = {
    usernameInput: '',
    passwordInput: '',
    loading: false
  }

  static contextTypes = {
    router: PropTypes.object
  }

  handleLogin = async () => {
    const body = {
      username: this.state.usernameInput,
      password: this.state.passwordInput
    }
    this.setState({loading: true})

    try {
      const response = await window.fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(body)
      })

      if (response.status === 401) {
        window.alert('Invalid Username/Password')
        throw Error('Invalid Username/Password')
      }

      this.setState({loading: false})
      window.localStorage.setItem('token', await response.text())
      this.context.router.history.push('/')
    } catch (e) {
      this.setState({loading: false})
      this.context.router.history.push('/login')
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
      <Form onSubmit={this.handleLogin} >
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

export default Login
