import { useEffect } from 'react'

/** Modal controlado por React (Bootstrap só fornece o CSS). Fecha com Esc ou clique no fundo. */
export default function Modal({ title, onClose, children, footer, size = '', busy = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose, busy])

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5">{title}</h2>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} disabled={busy}></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
