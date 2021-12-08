import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { StyledModal } from './StyledModal'

interface Props {
  ref?: any
  open?: Boolean
  draggable?: Boolean
  title?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  onClose?: () => void
}

export const Modal = React.forwardRef<any, Props>(
  ({ open, draggable = true, title, footer, children, onClose }, ref) => {
    const promiseRef = useRef<any>()
    const [innerOpen, setInnerOpen] = useState(false)
    const container = useMemo<Element | null>(() => {
      if (!open && !innerOpen) return null
      const div = document.createElement('div')
      document.body.append(div)
      return div
    }, [open, innerOpen])

    const handleMouseDown = useCallback(() => {
      if (!draggable) return
      document.addEventListener('mousemove', () => {})
      document.addEventListener('mouseup', () => {})
    }, [])

    const handleOpen = useCallback(async () => {
      setInnerOpen(true)
      promiseRef.current = {}
      promiseRef.current.promise = new Promise((resolve, reject) => {
        promiseRef.current.resolve = resolve
        promiseRef.current.reject = reject
      })
      return promiseRef.current.promise
    }, [])

    const handelConfirm = useCallback(async (result) => {
      setInnerOpen(false)
      if (promiseRef.current && promiseRef.current.resolve) {
        promiseRef.current.resolve(result)
      }
      if (onClose) onClose()
    }, [])

    const handelCancel = useCallback(async (result) => {
      setInnerOpen(false)
      if (promiseRef.current && promiseRef.current.reject) {
        promiseRef.current.reject(result)
      }
      if (onClose) onClose()
    }, [])

    const api = useMemo(
      () => ({
        open: handleOpen,
        confirm: handelConfirm,
        cancel: handelCancel
      }),
      []
    )

    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') ref(api)
        else ref.current = api
      }
      return () => {}
    }, [])

    console.log('🚀 ~ file: Modal.tsx ~ line 76 ~ container', container)
    if (!open && !innerOpen) return null
    if (!container) return null

    return ReactDOM.createPortal(
      open || innerOpen ? (
        <StyledModal>
          <div className='modal__backdrop'>
            <div className='modal__container'>
              <div className='modal__header'>
                {(title || draggable) && (
                  <div className='modal__title' onMouseDown={handleMouseDown}>
                    {title}
                  </div>
                )}
                <button className='modal__close-btn' onClick={handelCancel}>
                  X
                </button>
              </div>
              <div className='modal__body'>{children}</div>
              {footer && <div className='modal__footer'>{footer}</div>}
            </div>
          </div>
        </StyledModal>
      ) : (
        <React.Fragment> </React.Fragment>
      ),
      container
    )
  }
)
