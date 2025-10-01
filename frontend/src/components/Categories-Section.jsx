"use client"

import { useState } from "react"

export default function CategoriesSection() {

  return (
    <section className="categories-section section">
      <div className="section-header">
        <h2 className="section-title">Kategori</h2>
        <a href="/categories" className="view-all">
          Lihat Semua
        </a>
      </div>
      <div className="news-grid">
        {categoryItems.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-image-container">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={400}
                height={300}
                className="news-image"
                layout="responsive"
              />
            </div>
            <div className="news-content">
              <span className="news-category">{item.category}</span>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-excerpt">{item.excerpt}</p>
              <div className="news-meta">
                <span>{item.date}</span>
                <span>{item.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

