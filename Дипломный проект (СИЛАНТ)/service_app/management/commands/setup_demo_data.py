import datetime
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from service_app.models import (
    CustomUser, TechniqueModel, EngineModel, TransmissionModel,
    DriveAxleModel, SteeringAxleModel, MaintenanceType,
    FailureNode, RecoveryMethod, ServiceCompany,
    Machine, Maintenance, Complaint
)

class Command(BaseCommand):
    help = 'Prepopulate the database with demo directories, users, machines, TO and complaints'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        Complaint.objects.all().delete()
        Maintenance.objects.all().delete()
        Machine.objects.all().delete()
        CustomUser.objects.all().delete()
        
        # Clear directories
        TechniqueModel.objects.all().delete()
        EngineModel.objects.all().delete()
        TransmissionModel.objects.all().delete()
        DriveAxleModel.objects.all().delete()
        SteeringAxleModel.objects.all().delete()
        MaintenanceType.objects.all().delete()
        FailureNode.objects.all().delete()
        RecoveryMethod.objects.all().delete()
        ServiceCompany.objects.all().delete()

        self.stdout.write('Creating directories...')
        
        # Service Companies
        sc_czsa = ServiceCompany.objects.create(name="ЧЗСА Сервис", description="Сервисный отдел Чебоксарского завода силовых агрегатов")
        sc_kostroma = ServiceCompany.objects.create(name="КостромаСервис", description="Региональный сервисный партнер бренда 'Силант' в Костроме")
        sc_tech = ServiceCompany.objects.create(name="ООО ТехСервис", description="Независимая сервисная служба складского оборудования")
        
        # Technique Models
        tech_pg30 = TechniqueModel.objects.create(name="Силант ПГ-30", description="Вилочный автопогрузчик грузоподъемностью 3 тонны, бензиновый/газовый двигатель")
        tech_pd50 = TechniqueModel.objects.create(name="Силант ПД-50", description="Вилочный автопогрузчик повышенной проходимости, грузоподъемность 5 тонн, дизель")
        tech_ep20 = TechniqueModel.objects.create(name="Силант ЭП-20", description="Электрический вилочный погрузчик с грузоподъемностью 2 тонны для закрытых складов")

        # Engines
        eng_yamz = EngineModel.objects.create(name="ЯМЗ-534", description="Ярославский моторный завод - надежный 4-цилиндровый дизельный двигатель мощностью 136 л.с.")
        eng_mmz = EngineModel.objects.create(name="ММЗ Д-245.5S2", description="Минский моторный завод - классический дизель с турбонаддувом")
        eng_kubota = EngineModel.objects.create(name="Kubota V1505", description="Японский компактный дизельный двигатель с низким уровнем шума и выбросов")

        # Transmissions
        trans_gdp = TransmissionModel.objects.create(name="ГДП-6860", description="Гидродинамическая передача с электрическим переключением")
        trans_mech = TransmissionModel.objects.create(name="Механическая ЧЗСА", description="Механическая пятиступенчатая коробка передач производства ЧЗСА")
        trans_rex = TransmissionModel.objects.create(name="Гидростатическая Rexroth", description="Высокоточная гидростатическая трансмиссия Bosch Rexroth")

        # Drive Axles
        da_czsa = DriveAxleModel.objects.create(name="Мост ведущий ЧЗСА", description="Прочный ведущий мост усиленной конструкции ЧЗСА")
        da_raba = DriveAxleModel.objects.create(name="Мост ведущий Raba", description="Венгерский мост Raba с блокировкой дифференциала")
        da_mst = DriveAxleModel.objects.create(name="Мост ведущий MST", description="Специализированный тяжелый мост для грунтовых поверхностей")

        # Steering Axles
        sa_czsa = SteeringAxleModel.objects.create(name="Мост управляемый ЧЗСА", description="Задний управляемый мост со встроенным гидроцилиндром")
        sa_mst = SteeringAxleModel.objects.create(name="Мост управляемый MST", description="Управляемый мост с повышенным углом поворота колес")
        sa_carraro = SteeringAxleModel.objects.create(name="Мост управляемый Carraro", description="Итальянский управляемый мост с гидростатическим приводом")

        # Maintenance Types
        mt_to1 = MaintenanceType.objects.create(name="ТО-1", description="Первое техническое обслуживание (через 125/250 моточасов). Замена масла, фильтров, проверка гидросистемы.")
        mt_to2 = MaintenanceType.objects.create(name="ТО-2", description="Второе техническое обслуживание (через 500/1000 моточасов). Полная диагностика двигателя, замена ремней, протяжка соединений.")
        mt_eo = MaintenanceType.objects.create(name="ЕО (Ежедневное)", description="Ежедневный осмотр перед началом смены. Проверка уровней жидкостей, шин, световых приборов.")
        mt_season = MaintenanceType.objects.create(name="Сезонное ТО", description="Подготовка погрузчика к зимнему или летнему периоду эксплуатации. Замена масел на зимние/летние.")

        # Failure Nodes
        fn_trans = FailureNode.objects.create(name="Трансмиссия", description="Детали коробки передач, карданный вал, муфта сцепления")
        fn_hydr = FailureNode.objects.create(name="Гидравлическая система", description="Гидронасосы, распределители, гидроцилиндры подъема и наклона, шланги высокого давления")
        fn_eng = FailureNode.objects.create(name="Двигатель", description="Топливная аппаратура, система охлаждения, цилиндро-поршневая группа")
        fn_elec = FailureNode.objects.create(name="Электрооборудование", description="Стартер, генератор, аккумуляторная батарея, бортовая проводка")

        # Recovery Methods
        rm_replace = RecoveryMethod.objects.create(name="Замена деталей", description="Демонтаж изношенного/сломанного узла и установка новой оригинальной запчасти")
        rm_adjust = RecoveryMethod.objects.create(name="Регулировка узлов", description="Настройка зазоров, давления в гидросистеме или натяжения приводных ремней")
        rm_wire = RecoveryMethod.objects.create(name="Ремонт электропроводки", description="Замена поврежденного жгута проводов, пайка контактов, замена предохранителей")

        self.stdout.write('Creating users...')
        
        # Managers
        manager = CustomUser.objects.create_superuser(
            username="manager", 
            email="manager@silant.ru", 
            password="managerpass123",
            first_name="Иван",
            last_name="Иванов",
            role="manager"
        )
        
        # Clients
        client1 = CustomUser.objects.create_user(
            username="client1",
            email="client1@example.com",
            password="clientpass123",
            first_name="Сергей",
            last_name="Петров",
            role="client"
        )
        client2 = CustomUser.objects.create_user(
            username="client2",
            email="client2@example.com",
            password="clientpass123",
            first_name="Дмитрий",
            last_name="Смирнов",
            role="client"
        )

        # Service Company Users
        service_user1 = CustomUser.objects.create_user(
            username="service1",
            email="service1@silant.ru",
            password="servicepass123",
            first_name="Алексей",
            last_name="Козлов",
            role="service",
            service_company=sc_czsa
        )
        service_user2 = CustomUser.objects.create_user(
            username="service2",
            email="service2@silant.ru",
            password="servicepass123",
            first_name="Николай",
            last_name="Морозов",
            role="service",
            service_company=sc_kostroma
        )

        self.stdout.write('Creating machines...')
        
        # Machine 1 - client1, serviced by sc_czsa
        m1 = Machine.objects.create(
            vin="VIN00000000000001",
            technique_model=tech_pg30,
            engine_model=eng_yamz,
            engine_num="ENG-Y-10023",
            transmission_model=trans_gdp,
            transmission_num="TR-G-88231",
            drive_axle_model=da_czsa,
            drive_axle_num="DA-C-9921",
            steering_axle_model=sa_czsa,
            steering_axle_num="SA-C-4421",
            supply_contract="ДОГ-001 от 12.01.2025",
            shipping_date=datetime.date(2025, 1, 15),
            consignee="ООО ЛогистикГрупп",
            delivery_address="г. Москва, ул. Рябиновая, д. 45",
            equipment="Кондиционер кабины, вилы 1200мм, дополнительный гидрораспределитель",
            client=client1,
            service_company=sc_czsa
        )

        # Machine 2 - client1, serviced by sc_kostroma
        m2 = Machine.objects.create(
            vin="VIN00000000000002",
            technique_model=tech_pd50,
            engine_model=eng_mmz,
            engine_num="ENG-M-33211",
            transmission_model=trans_mech,
            transmission_num="TR-M-5521",
            drive_axle_model=da_raba,
            drive_axle_num="DA-R-1122",
            steering_axle_model=sa_mst,
            steering_axle_num="SA-M-8891",
            supply_contract="ДОГ-002 от 05.02.2025",
            shipping_date=datetime.date(2025, 2, 10),
            consignee="АО Костромской Лес",
            delivery_address="Костромская обл., пос. Судиславль, ул. Лесная, 12",
            equipment="Шины повышенной проходимости, подогрев сидения, проблесковый маячок",
            client=client1,
            service_company=sc_kostroma
        )

        # Machine 3 - client2, serviced by sc_kostroma
        m3 = Machine.objects.create(
            vin="VIN00000000000003",
            technique_model=tech_ep20,
            engine_model=eng_kubota,
            engine_num="ENG-K-4451",
            transmission_model=trans_rex,
            transmission_num="TR-R-9982",
            drive_axle_model=da_mst,
            drive_axle_num="DA-M-7721",
            steering_axle_model=sa_carraro,
            steering_axle_num="SA-C-6612",
            supply_contract="ДОГ-003 от 20.03.2025",
            shipping_date=datetime.date(2025, 3, 25),
            consignee="ООО СкладХолод",
            delivery_address="г. Ярославль, проспект Октября, д. 88",
            equipment="Хладостойкое исполнение (-30C), литий-ионная АКБ 48В, белые немаркие шины",
            client=client2,
            service_company=sc_kostroma
        )

        self.stdout.write('Creating maintenance records...')
        
        # Maintenances for Machine 1
        Maintenance.objects.create(
            machine=m1,
            maintenance_type=mt_eo,
            maintenance_date=datetime.date(2025, 2, 1),
            operating_hours=10,
            work_order_num="ЗН-001",
            work_order_date=datetime.date(2025, 2, 1),
            service_company=sc_czsa
        )
        Maintenance.objects.create(
            machine=m1,
            maintenance_type=mt_to1,
            maintenance_date=datetime.date(2025, 4, 15),
            operating_hours=250,
            work_order_num="ЗН-104",
            work_order_date=datetime.date(2025, 4, 14),
            service_company=sc_czsa
        )

        # Maintenances for Machine 2
        Maintenance.objects.create(
            machine=m2,
            maintenance_type=mt_to1,
            maintenance_date=datetime.date(2025, 5, 20),
            operating_hours=240,
            work_order_num="ЗН-К-12",
            work_order_date=datetime.date(2025, 5, 19),
            service_company=sc_kostroma
        )

        self.stdout.write('Creating complaints...')
        
        # Complaint for Machine 1
        Complaint.objects.create(
            machine=m1,
            failure_date=datetime.date(2025, 3, 10),
            operating_hours=120,
            failure_node=fn_elec,
            failure_description="Не запускается стартер, щелчки во втягивающем реле",
            recovery_method=rm_replace,
            parts_used="Реле стартера К-882, предохранитель 40А",
            recovery_date=datetime.date(2025, 3, 12),
            service_company=sc_czsa
        )

        # Complaint for Machine 2
        Complaint.objects.create(
            machine=m2,
            failure_date=datetime.date(2025, 6, 1),
            operating_hours=290,
            failure_node=fn_hydr,
            failure_description="Течь гидравлического масла из-под штуцера шланга высокого давления гидроцилиндра подъема",
            recovery_method=rm_adjust,
            parts_used="Уплотнительное кольцо гидросистемы O-Ring 12мм",
            recovery_date=datetime.date(2025, 6, 2),
            service_company=sc_kostroma
        )
        
        # Fix Site name to match default
        site = Site.objects.get_current()
        site.domain = 'localhost:8000'
        site.name = 'Мой Силант'
        site.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with demo data.'))
        self.stdout.write('Manager: manager / managerpass123')
        self.stdout.write('Client 1: client1 / clientpass123')
        self.stdout.write('Client 2: client2 / clientpass123')
        self.stdout.write('Service 1: service1 / servicepass123 (ЧЗСА Сервис)')
        self.stdout.write('Service 2: service2 / servicepass123 (КостромаСервис)')
