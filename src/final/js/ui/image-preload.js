
const IMAGES = [
  new URL('../../assets/images/plant/plant1-stage1.png', import.meta.url).href,
  new URL('../../assets/images/plant/plant1-stage2.png', import.meta.url).href,
  new URL('../../assets/images/plant/plant1-stage3.png', import.meta.url).href,
  new URL('../../assets/images/background-v1.jpg', import.meta.url).href,
];

export default function preloadImages() {
  IMAGES.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.decode();
  });
}
