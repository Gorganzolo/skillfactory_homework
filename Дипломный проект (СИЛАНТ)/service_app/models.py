from django.db import models
from django.contrib.auth.models import AbstractUser

class BaseDirectory(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Название")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

class TechniqueModel(BaseDirectory):
    class Meta:
        verbose_name = "Модель техники"
        verbose_name_plural = "Модели техники"

class EngineModel(BaseDirectory):
    class Meta:
        verbose_name = "Модель двигателя"
        verbose_name_plural = "Модели двигателей"

class TransmissionModel(BaseDirectory):
    class Meta:
        verbose_name = "Модель трансмиссии"
        verbose_name_plural = "Модели трансмиссий"

class DriveAxleModel(BaseDirectory):
    class Meta:
        verbose_name = "Модель ведущего моста"
        verbose_name_plural = "Модели ведущих мостов"

class SteeringAxleModel(BaseDirectory):
    class Meta:
        verbose_name = "Модель управляемого моста"
        verbose_name_plural = "Модели управляемых мостов"

class MaintenanceType(BaseDirectory):
    class Meta:
        verbose_name = "Вид ТО"
        verbose_name_plural = "Виды ТО"

class FailureNode(BaseDirectory):
    class Meta:
        verbose_name = "Узел отказа"
        verbose_name_plural = "Узлы отказа"

class RecoveryMethod(BaseDirectory):
    class Meta:
        verbose_name = "Способ восстановления"
        verbose_name_plural = "Способы восстановления"

class ServiceCompany(BaseDirectory):
    class Meta:
        verbose_name = "Сервисная компания"
        verbose_name_plural = "Сервисные компании"

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('manager', 'Менеджер'),
        ('client', 'Клиент'),
        ('service', 'Сервисная компания'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client', verbose_name="Роль")
    service_company = models.ForeignKey(
        'ServiceCompany', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        verbose_name="Связанная сервисная компания",
        help_text="Заполняется только для роли 'Сервисная компания'"
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

class Machine(models.Model):
    vin = models.CharField(max_length=150, unique=True, primary_key=True, verbose_name="Зав. № машины")
    technique_model = models.ForeignKey(TechniqueModel, on_delete=models.PROTECT, verbose_name="Модель техники")
    engine_model = models.ForeignKey(EngineModel, on_delete=models.PROTECT, verbose_name="Модель двигателя")
    engine_num = models.CharField(max_length=150, verbose_name="Зав. № двигателя")
    transmission_model = models.ForeignKey(TransmissionModel, on_delete=models.PROTECT, verbose_name="Модель трансмиссии")
    transmission_num = models.CharField(max_length=150, verbose_name="Зав. № трансмиссии")
    drive_axle_model = models.ForeignKey(DriveAxleModel, on_delete=models.PROTECT, verbose_name="Модель ведущего моста")
    drive_axle_num = models.CharField(max_length=150, verbose_name="Зав. № ведущего моста")
    steering_axle_model = models.ForeignKey(SteeringAxleModel, on_delete=models.PROTECT, verbose_name="Модель управляемого моста")
    steering_axle_num = models.CharField(max_length=150, verbose_name="Зав. № управляемого моста")
    
    supply_contract = models.CharField(max_length=255, verbose_name="Договор поставки №, дата")
    shipping_date = models.DateField(verbose_name="Дата отгрузки с завода")
    consignee = models.CharField(max_length=255, verbose_name="Грузополучатель (конечный потребитель)")
    delivery_address = models.CharField(max_length=255, verbose_name="Адрес поставки (эксплуатации)")
    equipment = models.TextField(verbose_name="Комплектация (доп. опции)", blank=True, null=True)
    
    client = models.ForeignKey(
        CustomUser, 
        on_delete=models.PROTECT, 
        limit_choices_to={'role': 'client'}, 
        verbose_name="Клиент",
        related_name="machines"
    )
    service_company = models.ForeignKey(
        ServiceCompany, 
        on_delete=models.PROTECT, 
        verbose_name="Сервисная компания",
        related_name="machines"
    )

    class Meta:
        ordering = ['-shipping_date']
        verbose_name = "Машина"
        verbose_name_plural = "Машины"

    def __str__(self):
        return f"{self.vin} ({self.technique_model.name})"

class Maintenance(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name="maintenances", verbose_name="Машина")
    maintenance_type = models.ForeignKey(MaintenanceType, on_delete=models.PROTECT, verbose_name="Вид ТО")
    maintenance_date = models.DateField(verbose_name="Дата проведения ТО")
    operating_hours = models.IntegerField(verbose_name="Наработка, м/час")
    work_order_num = models.CharField(max_length=150, verbose_name="№ заказ-наряда")
    work_order_date = models.DateField(verbose_name="Дата заказ-наряда")
    
    service_company = models.ForeignKey(
        ServiceCompany, 
        on_delete=models.PROTECT, 
        verbose_name="Организация, проводившая ТО",
        related_name="maintenances"
    )

    class Meta:
        ordering = ['-maintenance_date']
        verbose_name = "ТО"
        verbose_name_plural = "ТО"

    def __str__(self):
        return f"ТО {self.maintenance_type.name} - {self.machine.vin} ({self.maintenance_date})"

class Complaint(models.Model):
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name="complaints", verbose_name="Машина")
    failure_date = models.DateField(verbose_name="Дата отказа")
    operating_hours = models.IntegerField(verbose_name="Наработка, м/час")
    failure_node = models.ForeignKey(FailureNode, on_delete=models.PROTECT, verbose_name="Узел отказа")
    failure_description = models.TextField(verbose_name="Описание отказа")
    recovery_method = models.ForeignKey(RecoveryMethod, on_delete=models.PROTECT, verbose_name="Способ восстановления")
    parts_used = models.TextField(verbose_name="Используемые запасные части", blank=True, null=True)
    recovery_date = models.DateField(verbose_name="Дата восстановления")
    downtime = models.IntegerField(verbose_name="Время простоя техники (в днях)", blank=True)
    
    service_company = models.ForeignKey(
        ServiceCompany, 
        on_delete=models.PROTECT, 
        verbose_name="Сервисная компания",
        related_name="complaints"
    )

    class Meta:
        ordering = ['-failure_date']
        verbose_name = "Рекламация"
        verbose_name_plural = "Рекламации"

    def __str__(self):
        return f"Рекламация {self.machine.vin} - {self.failure_node.name} ({self.failure_date})"

    def save(self, *args, **kwargs):
        if self.recovery_date and self.failure_date:
            self.downtime = (self.recovery_date - self.failure_date).days
        else:
            self.downtime = 0
        super().save(*args, **kwargs)
