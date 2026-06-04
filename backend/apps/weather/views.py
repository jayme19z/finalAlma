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
                    "current": inline_serializer(
                        name="WeatherCurrent",
                        fields={
                            "temp": serializers.IntegerField(),
                            "feelsLike": serializers.IntegerField(),
                            "humidity": serializers.IntegerField(),
                            "windSpeed": serializers.FloatField(),
                            "weatherCode": serializers.IntegerField(),
                            "weatherKey": serializers.CharField(),
                            "icon": serializers.CharField(),
                            "isDay": serializers.BooleanField(),
                            "uvIndex": serializers.IntegerField(allow_null=True),
                            "visibility": serializers.IntegerField(allow_null=True),
                            "sunrise": serializers.CharField(allow_null=True),
                            "sunset": serializers.CharField(allow_null=True),
                            "date": serializers.CharField(),
                        },
                    ),
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
            "current": ",".join([
                "temperature_2m",
                "apparent_temperature",
                "relative_humidity_2m",
                "weather_code",
                "wind_speed_10m",
                "is_day",
            ]),
            "hourly": "visibility",
            "daily": ",".join([
                "temperature_2m_max",
                "temperature_2m_min",
                "weather_code",
                "precipitation_probability_max",
                "sunrise",
                "sunset",
                "uv_index_max",
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

        body = resp.json()
        d = body.get("daily", {})
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

        current = self._build_current(body, d, times)

        return Response({"current": current, "days": days}, status=status.HTTP_200_OK)

    @staticmethod
    def _build_current(body, daily, times):
        """Assemble the current-conditions block from the Open-Meteo payload."""
        cur = body.get("current") or {}
        if not cur:
            return None

        cur_code = cur.get("weather_code", 0)
        today_date = (cur.get("time") or "")[:10]

        # Index of "today" within the daily arrays (sunrise/sunset/UV are daily).
        try:
            today_idx = times.index(today_date)
        except ValueError:
            today_idx = 1 if len(times) > 1 else 0

        def daily_at(key):
            arr = daily.get(key) or []
            return arr[today_idx] if today_idx < len(arr) else None

        # Visibility (metres) for the current hour, converted to km.
        visibility_km = None
        hourly = body.get("hourly") or {}
        h_times = hourly.get("time") or []
        h_vis = hourly.get("visibility") or []
        current_hour = (cur.get("time") or "")[:13]
        for j, ht in enumerate(h_times):
            if ht[:13] == current_hour and j < len(h_vis) and h_vis[j] is not None:
                visibility_km = round(h_vis[j] / 1000)
                break

        uv = daily_at("uv_index_max")

        return {
            "temp": round(cur.get("temperature_2m", 0)),
            "feelsLike": round(cur.get("apparent_temperature", 0)),
            "humidity": round(cur.get("relative_humidity_2m", 0)),
            "windSpeed": round(cur.get("wind_speed_10m", 0), 1),
            "weatherCode": cur_code,
            "weatherKey": WMO_CODE_MAP.get(cur_code, "clear"),
            "icon": WMO_ICON_MAP.get(cur_code, "🌡️"),
            "isDay": bool(cur.get("is_day", 1)),
            "uvIndex": round(uv) if uv is not None else None,
            "visibility": visibility_km,
            "sunrise": daily_at("sunrise"),
            "sunset": daily_at("sunset"),
            "date": today_date,
        }