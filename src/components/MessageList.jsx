import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  messages: PropTypes.array.isRequired,
  of: PropTypes.func.isRequired
}

const MessageList = props =>
  <div>
    {props.messages.map((content, key) =>
      props.of(content, key)
    )}
  </div>

MessageList.propTypes = propTypes

export default MessageList
