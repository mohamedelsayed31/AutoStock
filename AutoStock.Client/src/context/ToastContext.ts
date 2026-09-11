import {
    createContext,
  } from "react";
  
  
  export type ToastType =
    "success" |
    "error" |
    "info";
  
  
  export interface ToastItem {
    id: string;
  
    message: string;
  
    type: ToastType;
  }
  
  
  export interface ToastContextValue {
    showToast: (
      message: string,
      type?: ToastType,
      duration?: number
    ) => void;
  }
  
  
  export const ToastContext =
    createContext<
      ToastContextValue | undefined
    >(undefined);