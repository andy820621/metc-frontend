import Floors, { FloorViewModel } from "src/api/floors";
// import Basement, { BasementViewModel } from "src/api/basement";
export async function getFloorsData(Bid: number) {
  const floorOptions: FloorViewModel[] = [];

  if (Bid) {
    const floorResult = (await Floors.apiGetBuildingFloor(
      Bid
    )) as typeof AxiosResponse;
    // const basementResult =
    //   (await Basement.apiGetBasement()) as typeof AxiosResponse;
    // basementResult.data.forEach((basement: BasementViewModel) => {
    //   floorOptions.push({
    //     ...basement,
    //     isBasement: true,
    //     isUnderground: basement.sort < 0,
    //   } as FloorViewModel);
    // });
    floorOptions.push(...floorResult.data);
    console.log("now floorOptions", floorOptions);
  }

  return floorOptions;
}
