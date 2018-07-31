import React from 'react'
import ChatContainer from './components/ChatContainer'
import CreateAccount from './components/CreateAccount'
import Login from './components/Login'

import { BrowserRouter, Route } from 'react-router-dom'

export default props =>
  <BrowserRouter>
    <div>
      <Route exact
        path='/'
        render={() => <ChatContainer />}
      />
      <Route exact
        path='/createAccount'
        render={() => <CreateAccount />}
      />
      <Route exact
        path='/login'
        render={() => <Login />}
      />
    </div>
  </BrowserRouter>
