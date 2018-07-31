import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  content: PropTypes.object.isRequired
}

const Message = props =>
  <div>
    <b>{props.content.username}:</b>
    {props.content.content}
  </div>

Message.propTypes = propTypes

export default Message
