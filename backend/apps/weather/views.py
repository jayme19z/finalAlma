import logging

import requests as http_requests
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
ALMATY_LAT = 43.2375
ALMATY_LON = 76.9457

WMO_CODE_MAP = {
    0: "clear", 1: "mainlyClear", 2: "partlyCloudy", 3: "overcast",
    45: "fog", 48: "fog",
    51: "drizzle", 53: "drizzle", 55: "drizzle",
    56: "freezingDrizzle", 57: "freezingDrizzle",
    61: "rain", 63: "rain", 65: "heavyRain",
    66: "freezingRain", 67: "freezingRain",
    71: "snow", 73: "snow", 75: "heavySnow", 77: "snowGrains",
    80: "rainShowers", 81: "rainShowers", 82: "heavyRainShowers",
    85: "snowShowers", 86: "snowShowers",
    95: "thunderstorm", 96: "thunderstormHail", 99: "thunderstormHail",
}

WMO_ICON_MAP = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️",
    51: "🌦️", 53: "🌦️", 55: "🌦️",
    56: "🌧️", 57: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️", 66: "🌧️", 67: "🌧️",
    71: "🌨️", 73: "🌨️", 75: "🌨️", 77: "🌨️",
    80: "🌦️", 81: "🌦️", 82: "🌧️",
    85: "🌨️", 86: "🌨️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
}


class WeatherView(APIView):
    """Proxy endpoint for the Open-Meteo daily forecast for Almaty."""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Weather"],
        summary="Get Almaty weather forecast",
        description=(
            "Returns a daily weather forecast for Almaty (yesterday + today + "
            "next 6 days) via the Open-Meteo API. No API key required."
        ),
        responses={
            200: inline_serializer(
                name="WeatherResponse",
                fields={
                    "days": serializers.ListField(
                        child=inline_serializer(
                            name="WeatherDay",
                            fields={
                                "date": serializers.CharField(),
                                "tempMax": serializers.IntegerField(),
                                "tempMin": serializers.IntegerField(),
                                "weatherCode": serializers.IntegerField(),
                                "weatherKey": serializers.CharField(),
                                "icon": serializers.CharField(),
                                "precipProbability": serializers.IntegerField(),
                            },
                        )
                    ),
                },
            ),
        },
    )
    def get(self, request):
        params = {
            "latitude": ALMATY_LAT,
            "longitude": ALMATY_LON,
            "daily": ",".join([
                "temperature_2m_max",
                "temperature_2m_min",
                "weather_code",
                "precipitation_probability_max",
            ]),
            "past_days": 1,
            "forecast_days": 7,
            "timezone": "Asia/Almaty",
        }

        try:
            resp = http_requests.get(OPEN_METEO_URL, params=params, timeout=10)
            resp.raise_for_status()
        except http_requests.RequestException:
            logger.exception("Open-Meteo API error")
            return Response({"error": "Weather service unavailable."}, status=status.HTTP_502_BAD_GATEWAY)

        d = resp.json().get("daily", {})
        times = d.get("time", [])

        days = []
        for i, date in enumerate(times):
            code = d["weather_code"][i]
            days.append({
                "date": date,
                "tempMax": round(d["temperature_2m_max"][i]),
                "tempMin": round(d["temperature_2m_min"][i]),
                "weatherCode": code,
                "weatherKey": WMO_CODE_MAP.get(code, "clear"),
                "icon": WMO_ICON_MAP.get(code, "🌡️"),
                "precipProbability": d["precipitation_probability_max"][i] or 0,
            })

        return Response({"days": days}, status=status.HTTP_200_OK)