export function getImageUrl(
    imagePath?: string | null
  ): string | null {
  
    if (!imagePath) {
      return null;
    }
  
  
    if (
      imagePath.startsWith(
        "http://"
      ) ||
      imagePath.startsWith(
        "https://"
      )
    ) {
      return imagePath;
    }
  
  
    const apiBaseUrl =
      import.meta.env
        .VITE_API_BASE_URL;
  
  
    const serverUrl =
      apiBaseUrl.replace(
        /\/api\/?$/,
        ""
      );
  
  
    return `${serverUrl}${imagePath}`;
  }