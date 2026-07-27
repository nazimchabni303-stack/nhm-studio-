import os
import glob
import re

overlay_html = """
<!-- Mobile Magazine Menu Overlay -->
<div class="mobile-menu-overlay">
    <div class="mobile-menu-header-bar">
        <span class="menu-title" style="font-family: var(--font-body); font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-dim);">Navigation</span>
        <button class="mobile-menu-close">Fermer ✕</button>
    </div>
    <div class="mobile-menu-scroll">
        <!-- Item 1 -->
        <a href="index.html" class="mobile-menu-item layout-left">
            <div class="menu-item-img">
                <img src="photo du studio/IMG_6451.webp" alt="Accueil">
            </div>
            <div class="menu-item-text">
                <span class="menu-cat">01 / Studio</span>
                <h2>Accueil</h2>
            </div>
        </a>
        <!-- Item 2 -->
        <a href="realisations.html" class="mobile-menu-item layout-right">
            <div class="menu-item-text">
                <span class="menu-cat">02 / Portfolio</span>
                <h2>Réalisations</h2>
            </div>
            <div class="menu-item-img">
                <img src="Real new nhm/01 WELLNES/Image 20_33_09.png" alt="Réalisations">
            </div>
        </a>
        <!-- Item 3 -->
        <a href="atelier-showroom.html" class="mobile-menu-item layout-full">
            <div class="menu-item-img">
                <img src="Real new nhm/BEDROOM/BEDROOM MASTER .png" alt="L'Atelier">
            </div>
            <div class="menu-item-text">
                <span class="menu-cat">03 / Design</span>
                <h2>L'Atelier</h2>
            </div>
        </a>
        <!-- Item 4 -->
        <a href="about.html" class="mobile-menu-item layout-left">
            <div class="menu-item-img">
                <img src="photo du studio/IMG_5987.webp" alt="Notre Histoire">
            </div>
            <div class="menu-item-text">
                <span class="menu-cat">04 / Agence</span>
                <h2>Notre Histoire</h2>
            </div>
        </a>
        <!-- Item 5 -->
        <a href="magazine.html" class="mobile-menu-item layout-right">
            <div class="menu-item-text">
                <span class="menu-cat">05 / Éditorial</span>
                <h2>Magazine</h2>
            </div>
            <div class="menu-item-img">
                <img src="photos/project3.jpg" alt="Magazine">
            </div>
        </a>
        <!-- Item 6 -->
        <a href="inspo.html" class="mobile-menu-item layout-full">
            <div class="menu-item-img">
                <img src="INSPO/neww/IMG_6661.JPG.jpeg" alt="Inspo">
            </div>
            <div class="menu-item-text">
                <span class="menu-cat">06 / Moodboard</span>
                <h2>Inspiration</h2>
            </div>
        </a>
    </div>
</div>
"""

html_files = glob.glob('*.html')
for html_file in html_files:
    if 'atelier-test.html' in html_file:
        continue
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    if '<button class="mobile-menu-btn">Menu</button>' not in content:
        content = re.sub(r'(</nav>)', r'\1\n        <button class="mobile-menu-btn">Menu</button>', content, count=1)
        changed = True

    if 'class="mobile-menu-overlay"' not in content:
        content = re.sub(r'(</header>)', r'\1\n' + overlay_html, content, count=1)
        changed = True

    if changed:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {html_file}')
