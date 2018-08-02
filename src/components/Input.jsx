import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

const Input = ({value, onChange, label, ...props}) =>
  <div className='mdl-textfield mdl-js-textfield'>
    <input
      value={value}
      onChange={onChange}
      className={`mdl-textfield__input ${props.className}`}
      type='text'
      id={label}
    />
    <label className='mdl-textfield__label' htmlFor={label}>
      {label}
    </label>
  </div>

Input.propTypes = propTypes

export default Input
