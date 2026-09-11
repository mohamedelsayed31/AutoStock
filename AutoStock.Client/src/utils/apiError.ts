import axios from "axios";


interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<
    string,
    string[]
  >;
}


export function getApiErrorMessage(
  error: unknown,
  fallbackMessage:
    string = "Something went wrong."
): string {

  if (
    !axios.isAxiosError(
      error
    )
  ) {
    return fallbackMessage;
  }


  const data =
    error.response
      ?.data as
      ProblemDetails | undefined;


  /*
   * ASP.NET ProblemDetails
   * detail
   */
  if (
    data?.detail
  ) {
    return data.detail;
  }


  /*
   * ASP.NET ValidationProblemDetails
   */
  if (
    data?.errors
  ) {
    const messages =
      Object.values(
        data.errors
      )
        .flat()
        .filter(Boolean);


    if (
      messages.length > 0
    ) {
      return messages.join(
        " "
      );
    }
  }


  /*
   * ProblemDetails title
   */
  if (
    data?.title
  ) {
    return data.title;
  }


  /*
   * HTTP status
   */
  if (
    error.response
      ?.status === 403
  ) {
    return (
      "You do not have permission to perform this action."
    );
  }


  if (
    error.response
      ?.status === 404
  ) {
    return (
      "The requested resource was not found."
    );
  }


  return fallbackMessage;
}