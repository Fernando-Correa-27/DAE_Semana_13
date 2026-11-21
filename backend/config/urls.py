from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # The web interface (HTML, session cookie). The API router is not touched.
    path("", include("quiz.web_urls")),
    # Catalog resources (categories and products) live next to the quiz API.
    path("api/", include("catalog.urls")),
    path("api/", include("quiz.urls")),
    # The contract: a machine-readable description of every operation of the API.
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if settings.DEBUG:
    # Uploaded product images are served by Django only while developing.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
