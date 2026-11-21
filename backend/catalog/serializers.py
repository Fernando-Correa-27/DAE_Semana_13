from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class ProductSerializer(serializers.ModelSerializer):
    """Product with its category nested in the same response.

    The listing therefore carries everything the catalog card needs in one
    request. Writes keep using a plain ``category_id`` so the client does not
    have to build a nested object just to move a product between categories.
    """

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "image",
            "category",
            "category_id",
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("The price cannot be negative.")
        return value
