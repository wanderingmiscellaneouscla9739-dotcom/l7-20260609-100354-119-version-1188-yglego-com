const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      showSlide(current + 1);
    }, 5200);
  }
}

for (const image of document.querySelectorAll('img')) {
  image.addEventListener('error', () => {
    image.classList.add('cover-hidden');
  });
}
