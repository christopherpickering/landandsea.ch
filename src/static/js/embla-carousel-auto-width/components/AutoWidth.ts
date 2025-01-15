import type {
  CreatePluginType,
  EmblaCarouselType,
  EmblaEventType,
} from 'embla-carousel';
import type { OptionsType } from './Options';

declare module 'embla-carousel' {
  interface EmblaPluginsType {
    AutoWidth: AutoWidthType;
  }
}

export type AutoWidthType = CreatePluginType<{}, OptionsType>;

export type AutoWidthOptionsType = AutoWidthType['options'];

function AutoWidth(userOptions: AutoWidthOptionsType = {}): AutoWidthType {
  let emblaApi: EmblaCarouselType;
  let slideWidths: number[] = [];
  const widthEvents: EmblaEventType[] = ['select', 'slideFocus'];

  function init(emblaApiInstance: EmblaCarouselType): void {
    emblaApi = emblaApiInstance;

    const {
      options: { axis },
      slideRects,
    } = emblaApi.internalEngine();

    if (axis === 'x') return;

    slideWidths = slideRects.map((slideRect) => slideRect.width);

    widthEvents.forEach((evt) => emblaApi.on(evt, setContainerWidth));
    setContainerWidth();
  }

  function destroy(): void {
    widthEvents.forEach((evt) => emblaApi.off(evt, setContainerWidth));
    const container = emblaApi.containerNode();
    container.style.width = '';
    if (!container.getAttribute('style')) container.removeAttribute('style');
  }

  function widestInView(): number | null {
    const { slideRegistry } = emblaApi.internalEngine();
    const selectedIndexes = slideRegistry[emblaApi.selectedScrollSnap()];

    if (!selectedIndexes) return null;

    return selectedIndexes
      .map((index) => slideWidths[index])
      .reduce((a, b) => Math.max(a, b), 0);
  }

  function setContainerWidth(): void {
    const width = widestInView();
    if (width === null) return;

    emblaApi.containerNode().style.width = `${widestInView()}px`;
  }

  const self: AutoWidthType = {
    name: 'AutoWidth',
    options: userOptions,
    init,
    destroy,
  };
  return self;
}

declare namespace AutoWidth {
  let globalOptions: AutoWidthOptionsType | undefined;
}

AutoWidth.globalOptions = undefined;

export default AutoWidth;
