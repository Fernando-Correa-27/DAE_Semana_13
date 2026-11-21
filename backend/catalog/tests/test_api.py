from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product


class CatalogApiTests(APITestCase):
    def setUp(self):
        self.technology = Category.objects.create(
            name="Tecnología",
            description="Dispositivos y accesorios.",
        )
        self.home = Category.objects.create(
            name="Hogar",
            description="Objetos para la casa.",
        )
        self.headphones = Product.objects.create(
            category=self.technology,
            name="Auriculares Nova",
            description="Auriculares inalámbricos.",
            price=Decimal("249.90"),
            stock=18,
        )
        self.lamp = Product.objects.create(
            category=self.home,
            name="Lámpara Lumen",
            description="Lámpara de mesa.",
            price=Decimal("89.90"),
            stock=30,
        )

    def test_product_list_embeds_the_category(self):
        response = self.client.get(reverse("product-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        first = response.data["results"][0]
        self.assertEqual(
            first["category"],
            {
                "id": self.technology.id,
                "name": "Tecnología",
                "description": "Dispositivos y accesorios.",
            },
        )
        self.assertNotIn("category_id", first)

    def test_category_list_is_not_paginated(self):
        response = self.client.get(reverse("category-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_products_can_be_filtered_by_category(self):
        response = self.client.get(reverse("product-list"), {"category": self.home.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Lámpara Lumen")

    def test_invalid_category_filter_returns_400(self):
        response = self.client.get(reverse("product-list"), {"category": "abc"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_product_can_be_created_with_category_id(self):
        response = self.client.post(
            reverse("product-list"),
            {
                "name": "Teclado Pulse",
                "description": "Teclado compacto.",
                "price": "329.00",
                "stock": 12,
                "category_id": self.technology.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"]["name"], "Tecnología")
        self.assertTrue(Product.objects.filter(name="Teclado Pulse").exists())

    def test_product_can_be_updated(self):
        response = self.client.patch(
            reverse("product-detail", args=[self.headphones.id]),
            {"price": "199.90", "category_id": self.home.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.headphones.refresh_from_db()
        self.assertEqual(self.headphones.price, Decimal("199.90"))
        self.assertEqual(self.headphones.category, self.home)

    def test_product_can_be_deleted(self):
        response = self.client.delete(
            reverse("product-detail", args=[self.headphones.id])
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.headphones.id).exists())

    def test_negative_price_is_rejected(self):
        response = self.client.post(
            reverse("product-list"),
            {
                "name": "Producto inválido",
                "price": "-1.00",
                "stock": 1,
                "category_id": self.technology.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price", response.data)
