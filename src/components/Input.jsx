import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

const Input = props =>
  <input
    type='text'
    value={props.value}
    onChange={props.onChange}
  />

Input.propTypes = propTypes

export default Input
