import React from 'react'
import UI from './components/UI'
import CreateAccount from './components/CreateAccount'
import CreateRoom from './components/CreateRoom'
import Login from './components/Login'

import { BrowserRouter, Route, Link } from 'react-router-dom'
import styled from 'styled-components'

const StyledLink = styled.span`
  & > * {
    text-decoration: none !important;
    color: white !important;
  }
`

const Wrapper = props =>
  <div className='mdl-layout mdl-js-layout'>
    <header className='mdl-layout__header mdl-layout__header--scroll'>
      <div className='mdl-layout__header-row'>
        <span className='mdl-layout-title'>SecureChat</span>
        <div className='mdl-layout-spacer' />
        <nav className='mdl-navigation'>
          <StyledLink className='mdl-navigation__link'><Link to='/createRoom'>Create Room</Link></StyledLink>
          <StyledLink className='mdl-navigation__link'><Link to='/createAccount'>Create Account</Link></StyledLink>
        </nav>
      </div>
    </header>
    <div className='mdl-layout__drawer'>
      <span className='mdl-layout-title'>Title</span>
      <nav className='mdl-navigation'>
        <StyledLink className='mdl-navigation__link'><Link to='/createRoom'>Create Room</Link></StyledLink>
        <StyledLink className='mdl-navigation__link'><Link to='/createAccount'>Create Account</Link></StyledLink>
      </nav>
    </div>
    <main className='mdl-layout__content'>
      <div className='page-content'>{props.children}</div>
    </main>
  </div>

export default props =>
  <BrowserRouter>
    <Wrapper>
      <Route exact
        path='/'
        render={() => <UI />}
      />
      <Route exact
        path='/createAccount'
        render={() => <CreateAccount />}
      />
      <Route exact
        path='/createRoom'
        render={() => <CreateRoom />}
      />
      <Route exact
        path='/login'
        render={() => <Login />}
      />
    </Wrapper>
  </BrowserRouter>
