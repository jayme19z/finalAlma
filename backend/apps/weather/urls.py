from django.urls import path

from apps.weather.views import WeatherView

urlpatterns = [
    path('', WeatherView.as_view(), name='weather'),
]