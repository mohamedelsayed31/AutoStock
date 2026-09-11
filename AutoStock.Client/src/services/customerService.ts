import api
  from "../api/axiosInstance";

import type {
  Customer,
  CustomerRequest,
} from "../types/customer";


export const getCustomers =
  async (): Promise<Customer[]> => {

    const response =
      await api.get<Customer[]>(
        "/Customers"
      );

    return response.data;
  };


export const getCustomerById =
  async (
    id: number
  ): Promise<Customer> => {

    const response =
      await api.get<Customer>(
        `/Customers/${id}`
      );

    return response.data;
  };


export const createCustomer =
  async (
    data: CustomerRequest
  ): Promise<Customer> => {

    const response =
      await api.post<Customer>(
        "/Customers",
        data
      );

    return response.data;
  };


export const updateCustomer =
  async (
    id: number,
    data: CustomerRequest
  ): Promise<void> => {

    await api.put(
      `/Customers/${id}`,
      data
    );
  };


export const deleteCustomer =
  async (
    id: number
  ): Promise<void> => {

    await api.delete(
      `/Customers/${id}`
    );
  };