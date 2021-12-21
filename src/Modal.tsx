import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useImperativeHandle
} from 'react'
import ReactDOM from 'react-dom'
import { StyledModal } from './StyledModal'

interface Props {
  ref?: any
  open?: Boolean
  draggable?: Boolean
  cancelIsReject?: Boolean
  title?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  onClose?: () => void
}
interface PromiseRef {
  promise?: Promise<any>
  resolve?: (result: any) => void
  reject?: (result: any) => void
}

export const Modal = React.forwardRef<any, Props>(
  (
    {
      open,
      draggable = true,
      title,
      footer,
      children,
      onClose,
      cancelIsReject = false
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const promiseRef = useRef<PromiseRef | null>(null)

    const [innerOpen, setInnerOpen] = useState(false)
    const [style, setStyle] = useState<React.CSSProperties>({})

    const container = useMemo<Element | null>(() => {
      if (!open && !innerOpen) return null
      const div = document.createElement('div')
      document.body.append(div)
      return div
    }, [open, innerOpen])

    const handleMouseDown = useCallback(() => {
      if (!draggable) return
      if (!containerRef.current) return
      const { offsetTop, offsetLeft } = containerRef.current
      setStyle({
        top: offsetTop,
        left: offsetLeft
      })
      const moveHandler = (e: MouseEvent) => {
        const { movementX, movementY } = e
        setStyle(({ top = 0, left = 0 }) => ({
          top: Number(top) + movementY,
          left: Number(left) + movementX
        }))
      }
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler)
        document.removeEventListener('mouseup', upHandler)
      }
      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('mouseup', upHandler)
    }, [])

    const handleOpen = useCallback(async () => {
      setInnerOpen(true)
      promiseRef.current = {}
      promiseRef.current.promise = new Promise<any>((resolve, reject) => {
        if (!promiseRef.current) return
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
      if (promiseRef.current) {
        if (cancelIsReject && promiseRef.current.reject) {
          promiseRef.current.reject(result || false)
        } else if (promiseRef.current.resolve) {
          promiseRef.current.resolve(result || false)
        }
      }
      if (onClose) onClose()
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        open: handleOpen,
        confirm: handelConfirm,
        cancel: handelCancel
      }),
      []
    )

    if (!open && !innerOpen) return null
    if (!container) return null

    return ReactDOM.createPortal(
      open || innerOpen ? (
        <StyledModal>
          <div className='modal__backdrop'>
            <div className='modal__container' style={style} ref={containerRef}>
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
