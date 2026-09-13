import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});


/* =========================
   Request Interceptor
========================= */

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");


    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }


    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/* =========================
   Response Interceptor
========================= */

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (
      error.response?.status === 401
    ) {

      const token =
        localStorage.getItem("token");


      /*
        If there is already a token,
        then the token is probably
        expired or invalid.

        We do NOT redirect on a failed
        login request because there is
        no token yet.
      */

      if (token) {

        localStorage.removeItem(
          "userId"
        );

        localStorage.removeItem(
          "fullName"
        );

        localStorage.removeItem(
          "email"
        );

        localStorage.removeItem(
          "role"
        );

        localStorage.removeItem(
          "token"
        );


        if (
          window.location.pathname !==
          "/login"
        ) {
          window.location.replace(
            "/login"
          );
        }
      }
    }


    return Promise.reject(error);
  }
);


export default axiosInstance;