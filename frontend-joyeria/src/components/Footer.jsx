import { BRAND_NAME, BRAND_LOGO } from '../utils/brand'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-narrow">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <img src={BRAND_LOGO} alt="" className="footer-logo-mark" />
              <p className="footer-logo">{BRAND_NAME}</p>
            </div>
            <p className="footer-tagline">Joyería fina artesanal</p>
          </div>
          <div className="footer-links">
            <a
              href="https://www.instagram.com/laurea_joyeria_fina?igsh=aWw0cmRsOTk1cWxp&igsi=aWw0cmRsOTk1cWxp"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
