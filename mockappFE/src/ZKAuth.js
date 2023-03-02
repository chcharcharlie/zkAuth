import React, { useState } from 'react';
import { BACKEND_URL } from './constants';

let browser = window
let popup = null
let timer = null

function watcher() {
  if (popup === null) {
    clearInterval(timer)
    timer = null
  } else if (popup !== null && !popup.closed) {
    popup.focus()
  } else if (popup !== null && popup.closed) {
    clearInterval(timer)
    browser.focus()
    timer = null
    popup = null
  }
}

function truncateUserId(userId) {
  const len = userId.length
  return userId.substring(0, 5) + "... ..." + userId.substring(len - 5, len)
}

const ZKAuth = (props) => {
  const { children, width, height, className, userIdClassName, onSignInSuccess, onSignInFail } = props
  const opts = `dependent=${1}, alwaysOnTop=${1}, alwaysRaised=${1}, alwaysRaised=${1}, width=${width || 600
    }, height=${height || 400} left=${left} top=${top}`
  browser = window.self
  const [userId, setUserId] = useState(false);

  const onClickHandler = (evt) => {
    console.log('onClickHandler', props)

    const { url, name } = props
    if (popup && !popup.closed) {
      popup.focus()
      return
    }

    popup = browser.open(url, name, opts)
    if (timer === null) {
      timer = setInterval(watcher, 500)
    }
    return
  }

  browser.addEventListener("message", async (event) => {
    if (event.origin === "http://localhost:3000") {
      const data = event.data
      const response = await fetch(`http://${BACKEND_URL}/api/validate_proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const response_json = await response.json()
      if (response_json.isVerified) {
        setUserId(data.publicResults.userId)
        onSignInSuccess(data.publicResults.userId)
      } else {
        setUserId("Sign in failed")
        onSignInFail()
      }
    }
  }, false);

  return (
    <div>
      {!userId && <div className={className} onClick={onClickHandler}>{children}</div>}
      {userId && <div className={userIdClassName}>Signed In as UserID: {truncateUserId(userId)}</div>}
    </div>
  )
}

const dualScreenLeft =
  window.screenLeft !== undefined ? window.screenLeft : window.screenX
const dualScreenTop =
  window.screenTop !== undefined ? window.screenTop : window.screenY

const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth
const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight
const systemZoom = width / window.screen.availWidth
const left = (width - 600) / 2 / systemZoom + dualScreenLeft
const top = (height - 400) / 2 / systemZoom + dualScreenTop

export default ZKAuth