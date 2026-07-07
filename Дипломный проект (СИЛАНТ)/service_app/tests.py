import datetime
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from .models import (
    CustomUser, TechniqueModel, EngineModel, TransmissionModel,
    DriveAxleModel, SteeringAxleModel, MaintenanceType,
    FailureNode, RecoveryMethod, ServiceCompany,
    Machine, Maintenance, Complaint
)

class SilantTests(TestCase):

    def setUp(self):
        # 1. Create directories
        self.tech_model = TechniqueModel.objects.create(name="ПГ-30", description="Desc")
        self.engine_model = EngineModel.objects.create(name="ЯМЗ-534", description="Desc")
        self.trans_model = TransmissionModel.objects.create(name="ГДП-6860", description="Desc")
        self.drive_model = DriveAxleModel.objects.create(name="Мост ЧЗСА", description="Desc")
        self.steer_model = SteeringAxleModel.objects.create(name="Мост управляемый", description="Desc")
        self.mt_to = MaintenanceType.objects.create(name="ТО-1", description="Desc")
        self.fn = FailureNode.objects.create(name="Двигатель", description="Desc")
        self.rm = RecoveryMethod.objects.create(name="Замена", description="Desc")
        self.sc = ServiceCompany.objects.create(name="ЧЗСА", description="Desc")

        # 2. Create users
        self.client_user = CustomUser.objects.create_user(
            username="client_test", password="testpass123", role="client"
        )
        self.service_user = CustomUser.objects.create_user(
            username="service_test", password="testpass123", role="service", service_company=self.sc
        )
        self.manager_user = CustomUser.objects.create_superuser(
            username="manager_test", password="testpass123", role="manager"
        )

        # 3. Create Machine
        self.machine = Machine.objects.create(
            vin="VINTEST12345",
            technique_model=self.tech_model,
            engine_model=self.engine_model,
            engine_num="ENG-123",
            transmission_model=self.trans_model,
            transmission_num="TR-123",
            drive_axle_model=self.drive_model,
            drive_axle_num="DA-123",
            steering_axle_model=self.steer_model,
            steering_axle_num="SA-123",
            supply_contract="Contract 1",
            shipping_date=datetime.date(2025, 1, 1),
            consignee="Consignee 1",
            delivery_address="Address 1",
            equipment="Equip 1",
            client=self.client_user,
            service_company=self.sc
        )

    def test_downtime_calculation(self):
        """Test that the downtime is automatically calculated correctly as recovery_date - failure_date in days."""
        complaint = Complaint.objects.create(
            machine=self.machine,
            failure_date=datetime.date(2025, 2, 1),
            operating_hours=100,
            failure_node=self.fn,
            failure_description="Test failure",
            recovery_method=self.rm,
            recovery_date=datetime.date(2025, 2, 15), # 14 days difference
            service_company=self.sc
        )
        self.assertEqual(complaint.downtime, 14)

    def test_guest_search(self):
        """Test that guest search by VIN returns the machine but with restricted fields."""
        c = Client()
        # Search for valid machine
        response = c.get(reverse('home'), {'vin': 'VINTEST12345'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'VINTEST12345')
        self.assertContains(response, 'ПГ-30') # technique_model
        
        # Make sure commercial details (not in fields 1-10) are NOT displayed for guest
        self.assertNotContains(response, 'Contract 1')
        self.assertNotContains(response, 'Consignee 1')

    def test_client_access(self):
        """Test that a client can only see their own machines."""
        c = Client()
        c.login(username="client_test", password="testpass123")
        response = c.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'VINTEST12345')

        # Create another client and verify they don't see this machine
        other_client = CustomUser.objects.create_user(
            username="other_client", password="testpass123", role="client"
        )
        c.login(username="other_client", password="testpass123")
        response = c.get(reverse('home'))
        self.assertNotContains(response, 'VINTEST12345')

    def test_rest_api_endpoint(self):
        """Test that REST API endpoints return json with correct format for authorized users."""
        c = Client()
        # Guests should get empty results/unauthorized
        response = c.get(reverse('api_machine-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK) # DRF allows request but return filtered (empty)
        self.assertEqual(len(response.json()), 0)

        # Logged in client should get their machines
        c.login(username="client_test", password="testpass123")
        response = c.get(reverse('api_machine-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]['vin'], 'VINTEST12345')
