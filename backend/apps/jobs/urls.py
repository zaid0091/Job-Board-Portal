from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import JobViewSet, JobCategoryListView, SavedJobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')

saved_router = DefaultRouter()
saved_router.register(r'', SavedJobViewSet, basename='saved-job')

urlpatterns = [
    path('jobs/categories/', JobCategoryListView.as_view(), name='job-categories'),
    path('jobs/saved/', include(saved_router.urls)),
    path('', include(router.urls)),
]
