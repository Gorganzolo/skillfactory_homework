from django import forms
from .models import Machine, Maintenance, Complaint, ServiceCompany

class MaintenanceForm(forms.ModelForm):
    class Meta:
        model = Maintenance
        fields = [
            'machine', 'maintenance_type', 'maintenance_date', 
            'operating_hours', 'work_order_num', 'work_order_date', 
            'service_company'
        ]
        widgets = {
            'maintenance_date': forms.DateInput(attrs={'type': 'date'}),
            'work_order_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        # Filter machines depending on user role
        if user:
            if user.role == 'client':
                self.fields['machine'].queryset = Machine.objects.filter(client=user)
            elif user.role == 'service':
                self.fields['machine'].queryset = Machine.objects.filter(service_company=user.service_company)
            # Manager sees all machines

class ComplaintForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = [
            'machine', 'failure_date', 'operating_hours', 
            'failure_node', 'failure_description', 'recovery_method', 
            'parts_used', 'recovery_date', 'service_company'
        ]
        widgets = {
            'failure_date': forms.DateInput(attrs={'type': 'date'}),
            'recovery_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            if user.role == 'service':
                self.fields['machine'].queryset = Machine.objects.filter(service_company=user.service_company)
            # Manager sees all machines
