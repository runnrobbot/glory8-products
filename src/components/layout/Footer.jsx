import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram } from 'lucide-react'

const WHATSAPP = {
  jakarta:  { number: '6281254388912',  label: 'Jakarta' },
  surabaya: { number: '6281359522218',  label: 'Surabaya' },
}

const LINKS = {
  Produk:   [
    { to: '/products',    label: 'Semua Produk' },
    { to: '/collections', label: 'Koleksi' },
    { to: '/inspiration', label: 'Inspirasi' },
  ],
  Perusahaan: [
    { to: '/about',   label: 'Tentang Kami' },
    { to: '/contact', label: 'Kontak' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <span
                className="text-white text-[20px] tracking-[0.25em] block"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
              >
                GLORY8
              </span>
              <span
                className="text-[#C9A455] text-[9px] tracking-[0.3em]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                PRODUCTS
              </span>
            </div>
            <p
              className="text-[#9C9890] text-[13px] leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Material interior premium — WPC Wall Panel, SPC Flooring, Vinyl, PVC Panel — untuk hunian dan proyek komersial terbaik Anda.
            </p>
            {/* WhatsApp CTA */}
            <div className="flex flex-col gap-2">
              {Object.values(WHATSAPP).map((wa) => (
                <a
                  key={wa.number}
                  href={`https://wa.me/${wa.number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[12px] text-[#C9A455] hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Phone size={12} strokeWidth={1.5} />
                  WhatsApp {wa.label}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p
                className="text-white text-[11px] tracking-[0.2em] uppercase mb-5"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {section}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[#9C9890] text-[13px] hover:text-[#C9A455] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <p
              className="text-white text-[11px] tracking-[0.2em] uppercase mb-5"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              Kontak
            </p>
            <ul className="flex flex-col gap-3 text-[#9C9890] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li className="flex items-start gap-2.5">
                <MapPin size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-[#C9A455]" />
                Indonesia
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} strokeWidth={1.5} className="flex-shrink-0 text-[#C9A455]" />
                <a href="mailto:info@glory8.com" className="hover:text-[#C9A455] transition-colors">
                  info@glory8.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[#9C9890] text-[12px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            © {new Date().getFullYear()} Glory8 Products. All rights reserved.
          </p>
          <p
            className="text-[#9C9890] text-[11px] tracking-wider"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Premium Interior Material
          </p>
        </div>
      </div>
    </footer>
  )
}
