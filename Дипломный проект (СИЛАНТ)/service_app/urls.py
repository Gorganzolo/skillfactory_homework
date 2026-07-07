from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api/machines', views.MachineViewSet, basename='api_machine')
router.register(r'api/maintenances', views.MaintenanceViewSet, basename='api_maintenance')
router.register(r'api/complaints', views.ComplaintViewSet, basename='api_complaint')

urlpatterns = [
    # Main Dashboard / Home
    path('', views.HomeView.as_view(), name='home'),
    
    # Machine Details / CRUD (Manager only for edit/add)
    path('machine/add/', views.MachineCreateView.as_view(), name='machine_add'),
    path('machine/<str:pk>/', views.MachineDetailView.as_view(), name='machine_detail'),
    path('machine/<str:pk>/edit/', views.MachineUpdateView.as_view(), name='machine_edit'),
    
    # Maintenance Details / CRUD
    path('maintenance/add/', views.MaintenanceCreateView.as_view(), name='maintenance_add'),
    path('maintenance/<int:pk>/', views.MaintenanceDetailView.as_view(), name='maintenance_detail'),
    path('maintenance/<int:pk>/edit/', views.MaintenanceUpdateView.as_view(), name='maintenance_edit'),
    
    # Complaint Details / CRUD
    path('complaint/add/', views.ComplaintCreateView.as_view(), name='complaint_add'),
    path('complaint/<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint_detail'),
    path('complaint/<int:pk>/edit/', views.ComplaintUpdateView.as_view(), name='complaint_edit'),
    
    # Dynamic Directory Details Page
    path('directory/<str:model_name>/<int:pk>/', views.DirectoryDetailView.as_view(), name='directory_detail'),
    
    # RESTful API Endpoints
    path('', include(router.urls)),
]
