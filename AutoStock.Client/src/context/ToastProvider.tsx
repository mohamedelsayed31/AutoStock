import {
    useCallback,
    useState,
  } from "react";
  
  import type {
    ReactNode,
  } from "react";
  
  import {
    CircleCheck,
    CircleX,
    Info,
    X,
  } from "lucide-react";
  
  import {
    ToastContext,
  } from "./ToastContext";
  
  import type {
    ToastItem,
    ToastType,
  } from "./ToastContext";
  
  
  interface ToastProviderProps {
    children: ReactNode;
  }
  
  
  function ToastProvider({
    children,
  }: ToastProviderProps) {
  
    const [
      toasts,
      setToasts,
    ] =
      useState<ToastItem[]>([]);
  
  
    const removeToast =
      useCallback(
        (
          id: string
        ) => {
  
          setToasts(
            current =>
              current.filter(
                toast =>
                  toast.id !== id
              )
          );
        },
        []
      );
  
  
    const showToast =
      useCallback(
        (
          message: string,
          type:
            ToastType = "success",
          duration:
            number = 3500
        ) => {
  
          const id =
            crypto.randomUUID();
  
  
          const newToast:
            ToastItem = {
  
            id,
  
            message,
  
            type,
          };
  
  
          setToasts(
            current => [
              ...current,
              newToast,
            ]
          );
  
  
          window.setTimeout(
            () => {
              removeToast(
                id
              );
            },
            duration
          );
        },
        [
          removeToast,
        ]
      );
  
  
    const getIcon = (
      type: ToastType
    ) => {
  
      switch (type) {
  
        case "success":
          return (
            <CircleCheck
              size={21}
            />
          );
  
        case "error":
          return (
            <CircleX
              size={21}
            />
          );
  
        case "info":
          return (
            <Info
              size={21}
            />
          );
      }
    };
  
  
    return (
      <ToastContext.Provider
        value={{
          showToast,
        }}
      >
  
        {children}
  
  
        <div className="toast-container">
  
          {toasts.map(
            toast => (
  
            <div
              key={toast.id}
              className={
                `toast toast-${toast.type}`
              }
            >
  
              <div className="toast-icon">
                {getIcon(
                  toast.type
                )}
              </div>
  
  
              <p>
                {toast.message}
              </p>
  
  
              <button
                type="button"
                className="toast-close"
                aria-label="Close notification"
                onClick={() =>
                  removeToast(
                    toast.id
                  )
                }
              >
                <X
                  size={16}
                />
              </button>
  
            </div>
  
            )
          )}
  
        </div>
  
      </ToastContext.Provider>
    );
  }
  
  
  export default ToastProvider;