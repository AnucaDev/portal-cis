from pathlib import Path
replacements = {
    '?? Zona Familias': '👤 Zona Familias',
    '?? Cerrar sesión': '🔒 Cerrar sesión',
    '?? Madrid · Atención Especializada': '🌟 Madrid · Atención Especializada',
    'class="disorder-icon ic-tdah">?': 'class="disorder-icon ic-tdah">⚡',
    'class="disorder-icon ic-tea">??': 'class="disorder-icon ic-tea">♾️',
    'class="disorder-icon ic-tel">???': 'class="disorder-icon ic-tel">🗣️',
    'class="disorder-icon ic-disl">??': 'class="disorder-icon ic-disl">📖',
    'class="disorder-icon ic-disc">??': 'class="disorder-icon ic-disc">🔢',
    'class="disorder-icon ic-diso">??': 'class="disorder-icon ic-diso">✏️',
    '>?? Señales de alerta<': '>⚠️ Señales de alerta<',
    '>?? Nuestro enfoque de intervención<': '>🎯 Nuestro enfoque de intervención<',
    '>?? Orientaciones para casa<': '>🏠 Orientaciones para casa<',
    '>?? Ver también<': '>🔎 Ver también<',
    '>?? Datos clave<': '>📌 Datos clave<',
    '>????? Nuestros especialistas<': '>👩‍⚕️ Nuestros especialistas<',
    'span class="specialist-icon">??': 'span class="specialist-icon">🧑‍⚕️',
    '>?? Contacto<': '>📞 Contacto<',
    'class="contact-item">?? <a href="tel:': 'class="contact-item">📞 <a href="tel:',
    'class="contact-item">?? <a href="mailto:': 'class="contact-item">✉️ <a href="mailto:',
    'class="contact-item">?? Calle': 'class="contact-item">📍 Calle',
    'class="contact-item">?? Lunes': 'class="contact-item">⏰ Lunes',
    '>?? Tu solicitud será revisada': '>📩 Tu solicitud será revisada',
    'div class="success-emoji">??<': 'div class="success-emoji">✅<',
    'label for="codigoAcceso">?? Código de acceso': 'label for="codigoAcceso">🔑 Código de acceso',
    '>?? 91': '>📞 91',
    '>?? info@cis-madrid.es': '>✉️ info@cis-madrid.es',
    '>?? Calle Mayor': '>📍 Calle Mayor',
    '>?? Lunes–Viernes': '>⏰ Lunes–Viernes',
    'span class="hero-badge">?? Terapeuta Ocupacional': 'span class="hero-badge">🧠 Terapeuta Ocupacional',
    'span class="hero-badge">?? Psicóloga': 'span class="hero-badge">👩‍⚕️ Psicóloga',
    'span class="hero-badge">??? Logopeda': 'span class="hero-badge">🗣️ Logopeda',
    'span class="hero-badge">?? Formación para familias': 'span class="hero-badge">🎓 Formación para familias',
}
html_dir = Path('c:/CIS2026/html')
for path in html_dir.glob('*.html'):
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Reparado: {path.name}')
print('Terminado!')
