---
title: Organizing Committee
layout: page
permalink: /committee/
---

{% assign photos = 
  ( 
    { image: "/assets/photo1.jpg", alt: "Photo 1", name: "John Doe", institution: "University of Example" },
    { image: "/assets/photo2.jpg", alt: "Photo 2", name: "Jane Smith", institution: "Another University" },
    { image: "/assets/photo3.jpg", alt: "Photo 3", name: "Alex Johnson", institution: "Example College" },
    { image: "/assets/photo4.jpg", alt: "Photo 4", name: "Emma Brown", institution: "University of Example" },
    { image: "/assets/photo5.jpg", alt: "Photo 5", name: "Michael Lee", institution: "Another University" },
    { image: "/assets/photo6.jpg", alt: "Photo 6", name: "Sophia Wilson", institution: "Example College" },
    { image: "/assets/photo7.jpg", alt: "Photo 7", name: "Oliver Davis", institution: "University of Example" }
  )
%}

<div class="gallery">
  {% for photo in photos %}
    <div class="gallery-item">
      <img src="{{ photo.image }}" alt="{{ photo.alt }}">
      <div class="caption">
        <h2>{{ photo.name }}</h2>
        <p>{{ photo.institution }}</p>
      </div>
    </div>
  {% endfor %}
</div>
