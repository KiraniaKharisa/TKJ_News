"use client"

import { useEffect, useState } from "react"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const [categories, setCategories] = useState([])
  const [links, setLinks] = useState([])
  const [socialLinks, setSocialLinks] = useState([
    { name: "Facebook", url: "https://facebook.com", icon: Facebook },
    { name: "Twitter", url: "https://twitter.com", icon: Twitter },
    { name: "Instagram", url: "https://instagram.com", icon: Instagram },
    { name: "YouTube", url: "https://youtube.com", icon: Youtube },
  ])
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-widgets">
          <div className="footer-widget footer-about">
            <h3>Tentang Kami</h3>
            <p>
              TKJaja adalah portal berita dan informasi terpercaya di Indonesia yang menyajikan berita-berita terkini
              dari berbagai kategori seperti politik, ekonomi, teknologi, olahraga, dan lainnya.
            </p>
            <div className="footer-social">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.url}>
                  <link.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-widget">
            <h3>Kategori</h3>
            <ul className="footer-links">
              {categories.map((category, index) => (
                <li key={index}>
                  <a href={`/artikels?kategori=${category.id}`}>{category.kategori}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-widget">
            <h3>Tautan</h3>
            <ul className="footer-links">
              {links.map((link, index) => (
                <li key={index}>
                  <a href={link.url}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} TulisAja.</p>
        </div>
      </div>
    </footer>
  )
}

