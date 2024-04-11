---
title: Organizing Committee
permalink: /committee/
---

<div class="gallery">
  {% for photo in site.data.photos %}
    <div class="gallery-item">
      <img src="{{ photo.image }}" alt="{{ photo.alt }}">
      <div class="caption">
        <h2>{{ photo.name }}</h2>
        <p>{{ photo.institution }}</p>
      </div>
    </div>
  {% endfor %}
</div>
