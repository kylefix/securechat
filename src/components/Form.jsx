import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Form extends Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.onSubmit()
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.props.children}
      </form>
    )
  }
}
