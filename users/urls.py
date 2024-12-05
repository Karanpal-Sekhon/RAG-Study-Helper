from django.urls import path
from .views import api_overview

urlpatterns = [
    path('', api_overview, name='api-overview'),
]
