import React from 'react';

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

const ZKAuth = (props) => {
  const { children, width, height, className, onSignInSuccess, onSignInFail } = props
  const opts = `dependent=${1}, alwaysOnTop=${1}, alwaysRaised=${1}, alwaysRaised=${1}, width=${width || 600
    }, height=${height || 400} left=${left} top=${top}`
  browser = window.self
  const { zkAuthUrl, zkAuthBackendUrl, ownAppOrigin, name } = props

  const onClickHandler = (evt) => {
    console.log('onClickHandler', props)

    if (popup && !popup.closed) {
      popup.focus()
      return
    }

    popup = browser.open(zkAuthUrl, name, opts)
    if (timer === null) {
      timer = setInterval(watcher, 500)
    }
    return
  }

  browser.addEventListener("message", async (event) => {
    if (event.origin === ownAppOrigin) {
      const data = event.data
      const response = await fetch(`${zkAuthBackendUrl}/api/validate_proof`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const response_json = await response.json()
      if (response_json.isVerified) {
        onSignInSuccess(data.publicResults.userId)
      } else {
        onSignInFail()
      }
    }
  }, false);

  return (
    <div className={className} onClick={onClickHandler}>{children}</div>
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