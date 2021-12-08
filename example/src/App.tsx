import React from 'react'

import { Modal } from 'ui-modal'

const App = () => {
  const modalRef = React.useRef<any>()
  return (
    <>
      <button
        onClick={async () => {
          if (modalRef.current) {
            const res = await modalRef.current.open()
            console.log('🚀 ~ file: App.tsx ~ line 13 ~ onClick={ ~ res', res)
          }
          console.log(
            '🚀 ~ file: App.tsx ~ line 12 ~ App ~ modalRef.current',
            modalRef.current
          )
        }}
      >
        open
      </button>
      <Modal ref={modalRef}>
        <button
          onClick={() => {
            if (modalRef.current) {
              modalRef.current.confirm(1)
            }
          }}
        >
          ok
        </button>
      </Modal>
    </>
  )
}

export default App
