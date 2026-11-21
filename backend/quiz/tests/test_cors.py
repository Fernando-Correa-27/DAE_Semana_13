"""CORS contract of the API: only the configured React origin may call it."""
import os
from unittest.mock import patch

from django.core.exceptions import ImproperlyConfigured
from django.test import TestCase, override_settings

from config.settings import _cors_allowed_origins

ALLOWED_ORIGIN = "http://localhost:5173"


class CorsMiddlewareTests(TestCase):
    @override_settings(CORS_ALLOWED_ORIGINS=[ALLOWED_ORIGIN])
    def test_allowed_origin_is_echoed_in_the_response(self):
        response = self.client.get("/api/exams/", HTTP_ORIGIN=ALLOWED_ORIGIN)

        self.assertEqual(response["Access-Control-Allow-Origin"], ALLOWED_ORIGIN)

    @override_settings(CORS_ALLOWED_ORIGINS=[ALLOWED_ORIGIN])
    def test_foreign_origin_receives_no_cors_permission(self):
        response = self.client.get("/api/exams/", HTTP_ORIGIN="http://evil.example")

        self.assertNotIn("Access-Control-Allow-Origin", response)

    @override_settings(CORS_ALLOWED_ORIGINS=[ALLOWED_ORIGIN])
    def test_preflight_answers_before_authentication(self):
        response = self.client.options(
            "/api/exams/",
            HTTP_ORIGIN=ALLOWED_ORIGIN,
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="DELETE",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,content-type",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Access-Control-Allow-Origin"], ALLOWED_ORIGIN)
        self.assertIn("DELETE", response["Access-Control-Allow-Methods"])
        self.assertIn("authorization", response["Access-Control-Allow-Headers"].lower())

    @override_settings(CORS_ALLOWED_ORIGINS=[ALLOWED_ORIGIN])
    def test_preflight_from_foreign_origin_is_not_authorized(self):
        response = self.client.options(
            "/api/exams/",
            HTTP_ORIGIN="http://evil.example",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
        )

        self.assertNotIn("Access-Control-Allow-Origin", response)


class CorsConfigurationTests(TestCase):
    def test_default_origin_is_the_vite_dev_server(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("CORS_ALLOWED_ORIGINS", None)
            self.assertEqual(_cors_allowed_origins(), [ALLOWED_ORIGIN])

    def test_environment_can_list_several_exact_origins(self):
        with patch.dict(
            os.environ,
            {"CORS_ALLOWED_ORIGINS": "http://localhost:5173, http://127.0.0.1:5173"},
        ):
            self.assertEqual(
                _cors_allowed_origins(),
                ["http://localhost:5173", "http://127.0.0.1:5173"],
            )

    def test_wildcard_is_forbidden(self):
        with patch.dict(os.environ, {"CORS_ALLOWED_ORIGINS": "*"}):
            with self.assertRaises(ImproperlyConfigured):
                _cors_allowed_origins()
