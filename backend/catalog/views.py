from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """Categories are public and intentionally unpaginated.

    The catalog filter needs the complete list to build its dropdown, so the
    global page size must not hide categories behind a second request.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                "category",
                int,
                description="Only the products of this category id.",
            ),
        ]
    )
)
class ProductViewSet(viewsets.ModelViewSet):
    """Product catalog with the category embedded in every response."""

    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # select_related avoids one extra query per product when the nested
        # category is serialized.
        queryset = Product.objects.select_related("category")
        raw_category = self.request.query_params.get("category")
        if raw_category is not None:
            value = raw_category.strip()
            if not value.isascii() or not value.isdecimal():
                raise ValidationError(
                    {"category": "Expected the id of a category, for example ?category=1."}
                )
            queryset = queryset.filter(category_id=int(value))
        return queryset
