export default function initSlider() {
  const track = document.querySelector('.slider__track');
  const slides = document.querySelectorAll('.slider__slide');
  const dots = document.querySelectorAll('.slider__dot');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const slideCount = slides.length;
  let interval;

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('slider__dot--active');
      } else {
        dot.classList.remove('slider__dot--active');
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  }

  function startInterval() {
    interval = setInterval(nextSlide, 5000);
  }

  function resetInterval() {
    clearInterval(interval);
    startInterval();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateSlider();
      resetInterval();
    });
  });

  startInterval();
}
