import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import AutoWidth from './embla-carousel-auto-width';

const OPTIONS = { axis: 'y', loop: true };

const emblaNode = document.querySelector('.embla');
const viewportNode = emblaNode.querySelector('.embla__viewport');

const emblaApi = EmblaCarousel(viewportNode, OPTIONS, [
  Autoplay({ playOnInit: true, delay: 1500 }),
  AutoWidth(),
]);
