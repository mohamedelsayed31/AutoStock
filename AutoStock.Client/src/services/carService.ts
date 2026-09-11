import axiosInstance from "../api/axiosInstance";

import type {
  Car,
  CarsResponse,
  CreateCarRequest,
  UpdateCarRequest,
} from "../types/car";


export interface CarQuery {
  search?: string;

  brandId?: number;
  categoryId?: number;
  supplierId?: number;

  year?: number;

  minPrice?: number;
  maxPrice?: number;

  stockStatus?: string;

  sortBy?: string;
  sortDirection?: string;

  page?: number;
  pageSize?: number;
}


/*
 * Get Cars
 */
export async function getCars(
  query: CarQuery
): Promise<CarsResponse> {

  const response =
    await axiosInstance.get<CarsResponse>(
      "/Cars",
      {
        params: query,
      }
    );


  return response.data;
}


/*
 * Get Car By Id
 */
export async function getCarById(
  id: number
): Promise<Car> {

  const response =
    await axiosInstance.get<Car>(
      `/Cars/${id}`
    );


  return response.data;
}


/*
 * Create Car
 */
export async function createCar(
  data: CreateCarRequest
): Promise<Car> {

  const response =
    await axiosInstance.post<Car>(
      "/Cars",
      data
    );


  return response.data;
}


/*
 * Update Car
 */
export async function updateCar(
  id: number,
  data: UpdateCarRequest
): Promise<void> {

  await axiosInstance.put(
    `/Cars/${id}`,
    data
  );
}


/*
 * Soft Delete Car
 */
export async function deleteCar(
  id: number
): Promise<void> {

  await axiosInstance.delete(
    `/Cars/${id}`
  );
}


/*
 * Upload / Replace Car Image
 */
export async function uploadCarImage(
  carId: number,
  file: File
): Promise<string> {

  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  const response =
    await axiosInstance.post<{
      imagePath: string;
    }>(
      `/Cars/${carId}/image`,
      formData
    );


  return response.data.imagePath;
}


/*
 * Delete Car Image
 */
export async function deleteCarImage(
  carId: number
): Promise<void> {

  await axiosInstance.delete(
    `/Cars/${carId}/image`
  );
}


/*
 * Get Archived Cars
 */
export async function getArchivedCars():
  Promise<Car[]> {

  const response =
    await axiosInstance.get<Car[]>(
      "/Cars/archived"
    );


  return response.data;
}


/*
 * Restore Archived Car
 */
export async function restoreCar(
  carId: number
): Promise<void> {

  await axiosInstance.patch(
    `/Cars/${carId}/restore`
  );
}