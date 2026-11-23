from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # The admin site manages the catalog and the quiz records.
    path("admin/", admin.site.urls),
    # The web interface (HTML, session cookie). The API router is not touched.
    path("", include("quiz.web_urls")),
    # The quiz router answers the API root first, exactly as it did in week 12.
    # Catalog paths do not match it and fall through to the next include.
    path("api/", include("quiz.urls")),
    # Catalog resources (categories and products) live next to the quiz API.
    path("api/", include("catalog.urls")),
    # The contract: a machine-readable description of every operation of the API.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if settings.DEBUG:
    # Uploaded product images are served by Django only while developing.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
