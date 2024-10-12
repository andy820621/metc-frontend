// FireCrew- TYPES
export interface carouselDataType {
  title: string;
  value: string;
  id: string;
}
export interface allCarouselDataType {
  carousel_1: carouselDataType[];
  carousel_2: carouselDataType[];
}
export type allCarouselDataTypeKeyArray = Array<keyof allCarouselDataType>;

export interface separateDataCarousel {
  detectorActionTime?: string;
  deviceContentList?: any[];
  emergencyMsgArray?: any[];
}
export interface separateDataType {
  carousel_1: separateDataCarousel;
  carousel_2: separateDataCarousel;
}
