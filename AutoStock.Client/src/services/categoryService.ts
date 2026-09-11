import axiosInstance from "../api/axiosInstance";

import type {
  Category,
  CategoryRequest,
} from "../types/category";


export async function getCategories(): Promise<Category[]> {
  const response =
    await axiosInstance.get<Category[]>(
      "/Categories"
    );

  return response.data;
}


export async function createCategory(
  data: CategoryRequest
): Promise<Category> {
  const response =
    await axiosInstance.post<Category>(
      "/Categories",
      data
    );

  return response.data;
}


export async function updateCategory(
  id: number,
  data: CategoryRequest
): Promise<void> {
  await axiosInstance.put(
    `/Categories/${id}`,
    data
  );
}


export async function deleteCategory(
  id: number
): Promise<void> {
  await axiosInstance.delete(
    `/Categories/${id}`
  );
}