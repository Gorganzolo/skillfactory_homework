document.addEventListener('DOMContentLoaded', () => {
    const slidesData = [
        {
            title: 'ROSTOV-ON-DON, ADMIRAL',
            city: 'Rostov-on-Don<br>LCD admiral',
            area: '81 m2',
            time: '3.5 months',
            cost: 'Upon request',
            image: 'img/image 2.1.png'
        },
        {
            title: 'SOCHI THIEVES',
            city: 'Sochi<br>Thieves',
            area: '105 m2',
            time: '4 months',
            cost: 'Upon request',
            image: 'img/Mask Group.png'
        },
        {
            title: 'ROSTOV-ON-DON PATRIOTIC',
            city: 'Rostov-on-Don<br>Patriotic',
            area: '93 m2',
            time: '3 months',
            cost: 'Upon request',
            image: 'img/Mask Group (1).png'
        }
    ];

    let currentSlide = 0;

    // DOM Elements
    const cityValue = document.getElementById('city-value');
    const areaValue = document.getElementById('area-value');
    const timeValue = document.getElementById('time-value');
    const costValue = document.getElementById('cost-value');
    const sliderImg = document.getElementById('slider-img');
    const navList = document.getElementById('nav-list');
    const dotsContainer = document.getElementById('dots-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Initialize Navigation and Dots
    function initSlider() {
        slidesData.forEach((slide, index) => {
            // Create Top Nav Items
            const li = document.createElement('li');
            li.classList.add('nav__item');
            li.textContent = slide.title;
            li.dataset.index = index;
            li.addEventListener('click', () => setSlide(index));
            navList.appendChild(li);

            // Create Dots
            const dot = document.createElement('button');
            dot.classList.add('controls__dot');
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => setSlide(index));
            dotsContainer.appendChild(dot);
        });

        // Set initial slide
        setSlide(0);
    }

    function setSlide(index) {
        currentSlide = index;
        const slide = slidesData[index];

        // Update Text
        cityValue.innerHTML = slide.city;
        areaValue.textContent = slide.area;
        timeValue.textContent = slide.time;
        costValue.textContent = slide.cost;

        // Update Image
        sliderImg.src = slide.image;
        sliderImg.alt = `Interior design in ${slide.title}`;

        // Update Active States
        updateActiveStates();
    }

    function updateActiveStates() {
        // Update Nav Links
        const navItems = navList.querySelectorAll('.nav__item');
        navItems.forEach((item, index) => {
            if (index === currentSlide) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Dots
        const dots = dotsContainer.querySelectorAll('.controls__dot');
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Arrow Event Listeners
    prevBtn.addEventListener('click', () => {
        let newIndex = currentSlide - 1;
        if (newIndex < 0) {
            newIndex = slidesData.length - 1;
        }
        setSlide(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentSlide + 1;
        if (newIndex >= slidesData.length) {
            newIndex = 0;
        }
        setSlide(newIndex);
    });

    // Run Initialization
    initSlider();
});
