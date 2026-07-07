from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, TechniqueModel, EngineModel, TransmissionModel, 
    DriveAxleModel, SteeringAxleModel, MaintenanceType, 
    FailureNode, RecoveryMethod, ServiceCompany, 
    Machine, Maintenance, Complaint
)

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'service_company', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_superuser', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительные поля роли', {'fields': ('role', 'service_company')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительные поля роли', {'fields': ('role', 'service_company')}),
    )

class BaseDirectoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = [
        'vin', 'technique_model', 'engine_model', 'engine_num', 
        'transmission_model', 'drive_axle_model', 'steering_axle_model', 
        'client', 'service_company', 'shipping_date'
    ]
    list_filter = ['technique_model', 'engine_model', 'service_company']
    search_fields = ['vin', 'engine_num', 'transmission_num', 'drive_axle_num', 'steering_axle_num']

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ['machine', 'maintenance_type', 'maintenance_date', 'operating_hours', 'work_order_num', 'service_company']
    list_filter = ['maintenance_type', 'service_company', 'maintenance_date']
    search_fields = ['machine__vin', 'work_order_num']

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['machine', 'failure_date', 'operating_hours', 'failure_node', 'recovery_method', 'downtime', 'service_company']
    list_filter = ['failure_node', 'recovery_method', 'service_company', 'failure_date']
    search_fields = ['machine__vin', 'failure_description', 'parts_used']
    readonly_fields = ['downtime']

# Register directories
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(TechniqueModel, BaseDirectoryAdmin)
admin.site.register(EngineModel, BaseDirectoryAdmin)
admin.site.register(TransmissionModel, BaseDirectoryAdmin)
admin.site.register(DriveAxleModel, BaseDirectoryAdmin)
admin.site.register(SteeringAxleModel, BaseDirectoryAdmin)
admin.site.register(MaintenanceType, BaseDirectoryAdmin)
admin.site.register(FailureNode, BaseDirectoryAdmin)
admin.site.register(RecoveryMethod, BaseDirectoryAdmin)
admin.site.register(ServiceCompany, BaseDirectoryAdmin)
