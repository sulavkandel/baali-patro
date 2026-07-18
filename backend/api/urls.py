from django.urls import path

from . import views

urlpatterns = [
    path("districts/", views.district_list, name="district-list"),
    path("crops/", views.crop_list, name="crop-list"),
    path("calendar/", views.calendar_view, name="calendar"),
    path("calendar/compare/", views.calendar_compare, name="calendar-compare"),
    path("advisory/current/", views.advisory_current, name="advisory-current"),
    path("advisory/regenerate/", views.advisory_regenerate, name="advisory-regenerate"),
]
