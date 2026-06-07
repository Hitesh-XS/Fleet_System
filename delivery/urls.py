from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, OrderViewSet, get_routes, run_assignment_algorithm, test_algorithms, system_health, \
    optimize_route

router=DefaultRouter()
router.register(r'vehicles',VehicleViewSet)
router.register(r'orders',OrderViewSet)

urlpatterns = [
    path('api/',include(router.urls)),
path('api/routes/', get_routes, name='get_routes'),
    path('api/assign/', run_assignment_algorithm, name='run_assignment_algorithm'),
    path('api/ algorithms/', test_algorithms, name='test_algorithms'), # <-- Added 's' and '/'
    path('api/health/',system_health, name='system_health'),
path('api/optimize/', optimize_route, name='optimize-route'),
]