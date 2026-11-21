"""Reproducible demo data for the catalog.

Run ``python manage.py seed_catalog`` after migrating. The command creates the
three categories and nine products, draws any missing seed image with Pillow,
copies the images into ``MEDIA_ROOT`` and leaves the database ready for the
catalog screen. It is idempotent: running it again updates the same records.
"""

import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from catalog.models import Category, Product

SEED_IMAGES_DIR = Path(__file__).resolve().parents[2] / "seed_images"
CANVAS = 900

CATEGORIES = [
    ("Tecnología", "Dispositivos y accesorios para el trabajo y el tiempo libre."),
    ("Hogar", "Objetos cotidianos con un diseño cálido y funcional."),
    ("Accesorios", "Complementos para acompañar el día a día."),
]

PRODUCTS = [
    {
        "slug": "auriculares-nova",
        "name": "Auriculares Nova",
        "category": "Tecnología",
        "description": "Auriculares inalámbricos con cancelación activa de ruido y 30 horas de batería.",
        "price": "249.90",
        "stock": 18,
        "palette": ((18, 42, 92), (13, 148, 136)),
        "icon": "headphones",
    },
    {
        "slug": "teclado-pulse",
        "name": "Teclado Mecánico Pulse",
        "category": "Tecnología",
        "description": "Teclado compacto de 75 % con interruptores táctiles y retroiluminación ajustable.",
        "price": "329.00",
        "stock": 12,
        "palette": ((49, 25, 92), (190, 24, 93)),
        "icon": "keyboard",
    },
    {
        "slug": "parlante-orbit",
        "name": "Parlante Orbit",
        "category": "Tecnología",
        "description": "Parlante portátil resistente al agua, con sonido estéreo y controles táctiles.",
        "price": "189.50",
        "stock": 25,
        "palette": ((154, 52, 18), (220, 38, 38)),
        "icon": "speaker",
    },
    {
        "slug": "lampara-lumen",
        "name": "Lámpara Lumen",
        "category": "Hogar",
        "description": "Lámpara de mesa con luz cálida regulable y brazo orientable de acero.",
        "price": "89.90",
        "stock": 30,
        "palette": ((120, 53, 15), (245, 158, 11)),
        "icon": "lamp",
    },
    {
        "slug": "taza-alba",
        "name": "Taza Cerámica Alba",
        "category": "Hogar",
        "description": "Taza de cerámica esmaltada, 350 ml, apta para microondas y lavavajillas.",
        "price": "39.90",
        "stock": 45,
        "palette": ((136, 19, 55), (251, 113, 133)),
        "icon": "mug",
    },
    {
        "slug": "difusor-brisa",
        "name": "Difusor de Aroma Brisa",
        "category": "Hogar",
        "description": "Difusor ultrasónico con temporizador y luz ambiental para espacios pequeños.",
        "price": "74.50",
        "stock": 20,
        "palette": ((6, 78, 59), (45, 212, 191)),
        "icon": "diffuser",
    },
    {
        "slug": "mochila-trek",
        "name": "Mochila Urbana Trek",
        "category": "Accesorios",
        "description": "Mochila de 22 litros con compartimento para portátil y tejido repelente al agua.",
        "price": "159.00",
        "stock": 15,
        "palette": ((30, 41, 59), (101, 163, 13)),
        "icon": "backpack",
    },
    {
        "slug": "reloj-steel",
        "name": "Reloj Minimal Steel",
        "category": "Accesorios",
        "description": "Reloj de acero con malla ajustable, cristal mineral y resistencia al agua.",
        "price": "219.00",
        "stock": 10,
        "palette": ((51, 65, 85), (202, 138, 4)),
        "icon": "watch",
    },
    {
        "slug": "botella-flow",
        "name": "Botella Térmica Flow",
        "category": "Accesorios",
        "description": "Botella de acero inoxidable de 750 ml que conserva la temperatura durante 12 horas.",
        "price": "59.90",
        "stock": 40,
        "palette": ((8, 47, 73), (14, 165, 233)),
        "icon": "bottle",
    },
]


def _gradient(start, end):
    """Vertical gradient with a soft light spot, drawn without external assets."""
    image = Image.new("RGB", (CANVAS, CANVAS))
    draw = ImageDraw.Draw(image)
    for y in range(CANVAS):
        ratio = y / (CANVAS - 1)
        color = tuple(round(a + (b - a) * ratio) for a, b in zip(start, end))
        draw.line([(0, y), (CANVAS, y)], fill=color)

    glow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((90, 40, 760, 710), fill=(255, 255, 255, 26))
    glow_draw.ellipse((470, 480, 980, 990), fill=(0, 0, 0, 28))
    return Image.alpha_composite(image.convert("RGBA"), glow).convert("RGB")


def _draw_icon(draw, icon):
    """Simple line-art product silhouettes, all original geometric drawings."""
    ink = (255, 255, 255)
    width = 26

    if icon == "headphones":
        draw.arc((245, 190, 655, 600), 180, 360, fill=ink, width=width)
        draw.rounded_rectangle((205, 430, 335, 655), radius=46, outline=ink, width=width)
        draw.rounded_rectangle((565, 430, 695, 655), radius=46, outline=ink, width=width)
        draw.rounded_rectangle((245, 470, 300, 610), radius=22, fill=ink)
        draw.rounded_rectangle((600, 470, 655, 610), radius=22, fill=ink)
    elif icon == "keyboard":
        draw.rounded_rectangle((150, 300, 750, 610), radius=38, outline=ink, width=width)
        for row in range(3):
            for column in range(8):
                x = 200 + column * 66
                y = 350 + row * 66
                draw.rounded_rectangle((x, y, x + 42, y + 42), radius=9, fill=ink)
        draw.rounded_rectangle((270, 548, 630, 584), radius=16, fill=ink)
    elif icon == "speaker":
        draw.rounded_rectangle((285, 160, 615, 740), radius=58, outline=ink, width=width)
        draw.ellipse((345, 245, 555, 455), outline=ink, width=width)
        draw.ellipse((410, 310, 490, 390), fill=ink)
        draw.ellipse((390, 555, 510, 675), outline=ink, width=width)
        draw.ellipse((430, 595, 470, 635), fill=ink)
    elif icon == "lamp":
        draw.polygon([(330, 230), (570, 230), (660, 420), (240, 420)], outline=ink, width=width)
        draw.line((450, 420, 450, 655), fill=ink, width=width)
        draw.rounded_rectangle((310, 655, 590, 710), radius=22, outline=ink, width=width)
        draw.line((290, 470, 230, 540), fill=ink, width=14)
        draw.line((610, 470, 670, 540), fill=ink, width=14)
    elif icon == "mug":
        draw.rounded_rectangle((265, 290, 585, 650), radius=48, outline=ink, width=width)
        draw.ellipse((265, 255, 585, 345), outline=ink, width=width)
        draw.arc((540, 350, 760, 590), 270, 90, fill=ink, width=width)
        draw.line((340, 390, 340, 540), fill=(255, 255, 255, 150), width=14)
    elif icon == "diffuser":
        draw.rounded_rectangle((325, 300, 575, 690), radius=70, outline=ink, width=width)
        draw.rounded_rectangle((400, 225, 500, 310), radius=18, outline=ink, width=width)
        draw.rounded_rectangle((385, 175, 515, 235), radius=20, fill=ink)
        draw.ellipse((280, 120, 340, 180), outline=ink, width=14)
        draw.ellipse((375, 80, 445, 150), outline=ink, width=14)
        draw.ellipse((485, 115, 545, 175), outline=ink, width=14)
        draw.arc((380, 430, 520, 570), 200, 340, fill=ink, width=18)
    elif icon == "backpack":
        draw.rounded_rectangle((270, 230, 630, 705), radius=90, outline=ink, width=width)
        draw.arc((330, 150, 570, 390), 180, 360, fill=ink, width=width)
        draw.rounded_rectangle((320, 480, 580, 650), radius=36, outline=ink, width=18)
        draw.line((450, 330, 450, 470), fill=ink, width=16)
    elif icon == "watch":
        draw.rounded_rectangle((370, 150, 530, 750), radius=46, outline=ink, width=18)
        draw.ellipse((270, 270, 630, 630), outline=ink, width=width)
        draw.ellipse((320, 320, 580, 580), outline=(255, 255, 255, 150), width=12)
        draw.line((450, 450, 450, 350), fill=ink, width=18)
        draw.line((450, 450, 530, 500), fill=ink, width=18)
        draw.ellipse((438, 438, 462, 462), fill=ink)
    elif icon == "bottle":
        draw.rounded_rectangle((330, 250, 570, 730), radius=80, outline=ink, width=width)
        draw.rounded_rectangle((395, 175, 505, 270), radius=18, outline=ink, width=width)
        draw.rounded_rectangle((380, 130, 520, 190), radius=22, fill=ink)
        draw.line((375, 390, 375, 600), fill=(255, 255, 255, 150), width=16)
        draw.line((450, 300, 450, 680), fill=(255, 255, 255, 55), width=8)


def ensure_seed_images():
    """Draw every missing seed image and return the paths by slug."""
    SEED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    paths = {}
    for product in PRODUCTS:
        path = SEED_IMAGES_DIR / f"{product['slug']}.jpg"
        if not path.exists():
            image = _gradient(*product["palette"])
            _draw_icon(ImageDraw.Draw(image), product["icon"])
            image.save(path, "JPEG", quality=90, optimize=True)
        paths[product["slug"]] = path
    return paths


class Command(BaseCommand):
    help = "Create the demo categories and products, with original Pillow images."

    def handle(self, *args, **options):
        images = ensure_seed_images()
        media_products = Path(settings.MEDIA_ROOT) / "products"
        media_products.mkdir(parents=True, exist_ok=True)

        categories = {}
        for name, description in CATEGORIES:
            category, _ = Category.objects.update_or_create(
                name=name,
                defaults={"description": description},
            )
            categories[name] = category

        for product in PRODUCTS:
            destination = media_products / f"{product['slug']}.jpg"
            shutil.copyfile(images[product["slug"]], destination)
            Product.objects.update_or_create(
                name=product["name"],
                defaults={
                    "category": categories[product["category"]],
                    "description": product["description"],
                    "price": Decimal(product["price"]),
                    "stock": product["stock"],
                    "image": f"products/{product['slug']}.jpg",
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Catalog ready: {len(categories)} categories and {len(PRODUCTS)} products."
            )
        )
