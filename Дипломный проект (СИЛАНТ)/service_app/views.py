from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import DetailView, CreateView, UpdateView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.http import Http404
from django.apps import apps
from django.urls import reverse_lazy

from rest_framework import viewsets

from .models import (
    Machine, Maintenance, Complaint, TechniqueModel, EngineModel, 
    TransmissionModel, DriveAxleModel, SteeringAxleModel, 
    MaintenanceType, FailureNode, RecoveryMethod, ServiceCompany
)
from .forms import MaintenanceForm, ComplaintForm
from .serializers import MachineSerializer, MaintenanceSerializer, ComplaintSerializer

# ----------------- Portal & Dashboard Views -----------------

class HomeView(View):
    template_name = 'service_app/home.html'

    def get(self, request, *args, **kwargs):
        user = request.user
        context = {}

        if not user.is_authenticated:
            # GUEST FLOW
            vin_query = request.GET.get('vin', '').strip()
            context['vin_query'] = vin_query
            if vin_query:
                try:
                    machine = Machine.objects.get(vin=vin_query)
                    context['machine'] = machine
                except Machine.DoesNotExist:
                    context['error_message'] = f"Данных о машине с заводским номером '{vin_query}' нет в системе."
            return render(request, self.template_name, context)

        # AUTHENTICATED USER FLOW
        # 1. Base Querysets based on roles
        if user.role == 'manager':
            machines_qs = Machine.objects.all()
            maintenances_qs = Maintenance.objects.all()
            complaints_qs = Complaint.objects.all()
        elif user.role == 'client':
            machines_qs = Machine.objects.filter(client=user)
            maintenances_qs = Maintenance.objects.filter(machine__client=user)
            complaints_qs = Complaint.objects.filter(machine__client=user)
        elif user.role == 'service':
            machines_qs = Machine.objects.filter(service_company=user.service_company)
            maintenances_qs = Maintenance.objects.filter(machine__service_company=user.service_company)
            complaints_qs = Complaint.objects.filter(machine__service_company=user.service_company)
        else:
            machines_qs = Machine.objects.none()
            maintenances_qs = Maintenance.objects.none()
            complaints_qs = Complaint.objects.none()

        # 2. Filters for Machines
        f_tech = request.GET.get('tech_model')
        f_eng = request.GET.get('eng_model')
        f_trans = request.GET.get('trans_model')
        f_drive = request.GET.get('drive_model')
        f_steer = request.GET.get('steer_model')

        if f_tech: machines_qs = machines_qs.filter(technique_model_id=f_tech)
        if f_eng: machines_qs = machines_qs.filter(engine_model_id=f_eng)
        if f_trans: machines_qs = machines_qs.filter(transmission_model_id=f_trans)
        if f_drive: machines_qs = machines_qs.filter(drive_axle_model_id=f_drive)
        if f_steer: machines_qs = machines_qs.filter(steering_axle_model_id=f_steer)

        # 3. Filters for Maintenance
        f_m_type = request.GET.get('m_type')
        f_m_company = request.GET.get('m_company')
        f_m_vin = request.GET.get('m_vin')

        if f_m_type: maintenances_qs = maintenances_qs.filter(maintenance_type_id=f_m_type)
        if f_m_company: maintenances_qs = maintenances_qs.filter(service_company_id=f_m_company)
        if f_m_vin: maintenances_qs = maintenances_qs.filter(machine__vin__icontains=f_m_vin)

        # 4. Filters for Complaints
        f_c_node = request.GET.get('c_node')
        f_c_method = request.GET.get('c_method')
        f_c_company = request.GET.get('c_company')

        if f_c_node: complaints_qs = complaints_qs.filter(failure_node_id=f_c_node)
        if f_c_method: complaints_qs = complaints_qs.filter(recovery_method_id=f_c_method)
        if f_c_company: complaints_qs = complaints_qs.filter(service_company_id=f_c_company)

        # 5. Add items to context
        context['machines'] = machines_qs
        context['maintenances'] = maintenances_qs
        context['complaints'] = complaints_qs

        # 6. Load Directory Lists for Dropdown Filters
        context['tech_models'] = TechniqueModel.objects.all()
        context['engine_models'] = EngineModel.objects.all()
        context['transmission_models'] = TransmissionModel.objects.all()
        context['drive_axle_models'] = DriveAxleModel.objects.all()
        context['steering_axle_models'] = SteeringAxleModel.objects.all()
        context['maintenance_types'] = MaintenanceType.objects.all()
        context['service_companies'] = ServiceCompany.objects.all()
        context['failure_nodes'] = FailureNode.objects.all()
        context['recovery_methods'] = RecoveryMethod.objects.all()

        # 7. Remember selected filters to keep state in forms
        context['selected'] = {
            'tech_model': f_tech,
            'eng_model': f_eng,
            'trans_model': f_trans,
            'drive_model': f_drive,
            'steer_model': f_steer,
            'm_type': f_m_type,
            'm_company': f_m_company,
            'm_vin': f_m_vin,
            'c_node': f_c_node,
            'c_method': f_c_method,
            'c_company': f_c_company,
        }

        # 8. Check current active tab
        context['active_tab'] = request.GET.get('tab', 'machines')

        return render(request, self.template_name, context)


# ----------------- Detailed Views -----------------

class MachineDetailView(LoginRequiredMixin, DetailView):
    model = Machine
    template_name = 'service_app/machine_detail.html'
    context_object_name = 'machine'

    def get_queryset(self):
        # Enforce row-level permissions
        user = self.request.user
        if user.role == 'manager':
            return Machine.objects.all()
        elif user.role == 'client':
            return Machine.objects.filter(client=user)
        elif user.role == 'service':
            return Machine.objects.filter(service_company=user.service_company)
        return Machine.objects.none()


class MaintenanceDetailView(LoginRequiredMixin, DetailView):
    model = Maintenance
    template_name = 'service_app/maintenance_detail.html'
    context_object_name = 'maintenance'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return Maintenance.objects.all()
        elif user.role == 'client':
            return Maintenance.objects.filter(machine__client=user)
        elif user.role == 'service':
            return Maintenance.objects.filter(machine__service_company=user.service_company)
        return Maintenance.objects.none()


class ComplaintDetailView(LoginRequiredMixin, DetailView):
    model = Complaint
    template_name = 'service_app/complaint_detail.html'
    context_object_name = 'complaint'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return Complaint.objects.all()
        elif user.role == 'client':
            return Complaint.objects.filter(machine__client=user)
        elif user.role == 'service':
            return Complaint.objects.filter(machine__service_company=user.service_company)
        return Complaint.objects.none()


class DirectoryDetailView(LoginRequiredMixin, DetailView):
    template_name = 'service_app/directory_detail.html'
    context_object_name = 'directory_item'

    def get_object(self, queryset=None):
        model_name = self.kwargs.get('model_name')
        pk = self.kwargs.get('pk')
        
        # Security map of allowed directories to load dynamically
        allowed_models = {
            'techniquemodel': TechniqueModel,
            'enginemodel': EngineModel,
            'transmissionmodel': TransmissionModel,
            'driveaxlemodel': DriveAxleModel,
            'steeringaxlemodel': SteeringAxleModel,
            'maintenancetype': MaintenanceType,
            'failurenode': FailureNode,
            'recoverymethod': RecoveryMethod,
            'servicecompany': ServiceCompany,
        }
        
        model_class = allowed_models.get(model_name.lower())
        if not model_class:
            raise Http404("Запрошенный справочник не существует")
            
        try:
            return model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            raise Http404("Запись в справочнике не найдена")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Pass model human readable title
        context['directory_title'] = self.get_object()._meta.verbose_name
        return context


# ----------------- Create / Update Views -----------------

class ManagerRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.role == 'manager'

class MachineCreateView(ManagerRequiredMixin, CreateView):
    model = Machine
    fields = '__all__'
    template_name = 'service_app/machine_form.html'
    success_url = reverse_lazy('home')

class MachineUpdateView(ManagerRequiredMixin, UpdateView):
    model = Machine
    fields = '__all__'
    template_name = 'service_app/machine_form.html'
    success_url = reverse_lazy('home')


class MaintenanceCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Maintenance
    form_class = MaintenanceForm
    template_name = 'service_app/maintenance_form.html'
    success_url = reverse_lazy('home')

    def test_func(self):
        # Client, Service, and Manager can create
        return self.request.user.is_authenticated and self.request.user.role in ['manager', 'client', 'service']

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

class MaintenanceUpdateView(ManagerRequiredMixin, UpdateView):
    model = Maintenance
    form_class = MaintenanceForm
    template_name = 'service_app/maintenance_form.html'
    success_url = reverse_lazy('home')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs


class ComplaintCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Complaint
    form_class = ComplaintForm
    template_name = 'service_app/complaint_form.html'
    success_url = reverse_lazy('home')

    def test_func(self):
        # Only Service Company and Manager can create complaints
        return self.request.user.is_authenticated and self.request.user.role in ['manager', 'service']

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

class ComplaintUpdateView(ManagerRequiredMixin, UpdateView):
    model = Complaint
    form_class = ComplaintForm
    template_name = 'service_app/complaint_form.html'
    success_url = reverse_lazy('home')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs


# ----------------- RESTful API ViewSets -----------------

class MachineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MachineSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Machine.objects.none()
        if user.role == 'manager':
            return Machine.objects.all()
        elif user.role == 'client':
            return Machine.objects.filter(client=user)
        elif user.role == 'service':
            return Machine.objects.filter(service_company=user.service_company)
        return Machine.objects.none()

class MaintenanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Maintenance.objects.none()
        if user.role == 'manager':
            return Maintenance.objects.all()
        elif user.role == 'client':
            return Maintenance.objects.filter(machine__client=user)
        elif user.role == 'service':
            return Maintenance.objects.filter(machine__service_company=user.service_company)
        return Maintenance.objects.none()

class ComplaintViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Complaint.objects.none()
        if user.role == 'manager':
            return Complaint.objects.all()
        elif user.role == 'client':
            return Complaint.objects.filter(machine__client=user)
        elif user.role == 'service':
            return Complaint.objects.filter(machine__service_company=user.service_company)
        return Complaint.objects.none()
