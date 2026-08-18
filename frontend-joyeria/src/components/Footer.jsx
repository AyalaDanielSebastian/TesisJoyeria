import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../utils/brand'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-narrow">
        <div className="footer-top">
          <div>
            <p className="footer-logo">{BRAND_NAME}</p>
            <p className="footer-tagline">Joyería fina artesanal</p>
          </div>
          <div className="footer-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
            <Link to="/login">Contacto</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
