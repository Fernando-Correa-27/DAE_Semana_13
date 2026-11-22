from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "products_total")
    search_fields = ("name", "description")

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(products_total=Count("products"))

    @admin.display(description="Productos", ordering="products_total")
    def products_total(self, obj):
        return obj.products_total


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "image_preview")
    list_filter = ("category",)
    search_fields = ("name", "description", "category__name")
    list_select_related = ("category",)
    readonly_fields = ("image_preview",)

    @admin.display(description="Imagen")
    def image_preview(self, obj):
        if not obj.image:
            return "Sin imagen"
        # The project's CSP blocks inline styles, so the thumbnail is sized
        # with plain HTML attributes instead of a style attribute.
        return format_html(
            '<img src="{}" alt="{}" width="64" height="48" />',
            obj.image.url,
            obj.name,
        )
