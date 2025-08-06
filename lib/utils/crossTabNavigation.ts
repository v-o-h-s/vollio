/**
 * Utilities for cross-tab communication and PDF navigation
 */

export interface NavigationParams {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PostMessageNavigationData {
  type: "PDF_NAVIGATION";
  page: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  hash: string;
}

/**
 * Validates navigation parameters to ensure they are safe and reasonable
 */
export function validateNavigationParams(params: NavigationParams): boolean {
  // Validate page number
  if (!Number.isInteger(params.page) || params.page < 1) {
    console.warn("Invalid page number:", params.page);
    return false;
  }

  // Validate coordinates
  if (params.x < 0 || params.y < 0 || params.width <= 0 || params.height <= 0) {
    console.warn("Invalid coordinates:", params);
    return false;
  }

  // Check for reasonable bounds (prevent extremely large values)
  const maxCoordinate = 10000; // Reasonable maximum for PDF coordinates
  if (
    params.x > maxCoordinate ||
    params.y > maxCoordinate ||
    params.width > maxCoordinate ||
    params.height > maxCoordinate
  ) {
    console.warn("Coordinates exceed reasonable bounds:", params);
    return false;
  }

  return true;
}

/**
 * Parses URL hash parameters for PDF navigation
 * Supports format: #pdf?page=3&x=120&y=450&width=200&height=18
 */
export function parseNavigationHash(hash: string): NavigationParams | null {
  try {
    if (!hash.startsWith("#pdf?")) {
      return null;
    }

    const urlParams = new URLSearchParams(hash.substring(5)); // Remove '#pdf?'
    const page = urlParams.get("page");
    const x = urlParams.get("x");
    const y = urlParams.get("y");
    const width = urlParams.get("width");
    const height = urlParams.get("height");

    if (page && x && y && width && height) {
      const parsedParams: NavigationParams = {
        page: parseInt(page, 10),
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
      };

      // Validate parsed parameters
      if (validateNavigationParams(parsedParams)) {
        console.log("Valid hash navigation parameters:", parsedParams);
        return parsedParams;
      }
    }
  } catch (error) {
    console.warn("Error parsing navigation hash:", error);
  }

  return null;
}

/**
 * Parses URL search parameters for PDF navigation
 * Supports format: ?page=3&x=120&y=450&width=200&height=18
 */
export function parseNavigationSearchParams(
  searchParams: URLSearchParams
): NavigationParams | null {
  try {
    const page = searchParams.get("page");
    const x = searchParams.get("x");
    const y = searchParams.get("y");
    const width = searchParams.get("width");
    const height = searchParams.get("height");

    if (page && x && y && width && height) {
      const parsedParams: NavigationParams = {
        page: parseInt(page, 10),
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
      };

      // Validate parsed parameters
      if (validateNavigationParams(parsedParams)) {
        console.log("Valid search params navigation parameters:", parsedParams);
        return parsedParams;
      }
    }
  } catch (error) {
    console.warn("Error parsing navigation search params:", error);
  }

  return null;
}

/**
 * Creates a PDF location hash from navigation parameters
 */
export function createNavigationHash(params: NavigationParams): string {
  return `#pdf?page=${params.page}&x=${params.x}&y=${params.y}&width=${params.width}&height=${params.height}`;
}

/**
 * Attempts cross-tab communication with enhanced error handling
 * Returns true if communication was successful, false otherwise
 */
export function attemptCrossTabNavigation(
  navigationHash: string,
  navigationParams: NavigationParams,
  options: {
    closeCurrentTab?: boolean;
    fallbackUrl?: string;
  } = {}
): boolean {
  const { closeCurrentTab = false, fallbackUrl = "/dashboard/pdf-notes" } =
    options;

  if (!window.opener || window.opener.closed) {
    console.log("No opener window available");
    return false;
  }

  try {
    // Test if opener window is accessible (same origin)
    const openerLocation = window.opener.location;

    // If we can access the location, proceed with navigation
    if (openerLocation && typeof openerLocation.pathname === "string") {
      const basePath = "/dashboard/pdf-notes";

      // Check if opener is already on PDF notes page
      if (openerLocation.pathname.includes("pdf-notes")) {
        console.log(
          "Opener is on PDF notes page, updating hash for navigation"
        );

        // Clear any existing hash first to ensure hashchange event fires
        if (openerLocation.hash) {
          window.opener.location.hash = "";
          // Small delay to ensure hash is cleared
          setTimeout(() => {
            window.opener.location.hash = navigationHash;
          }, 50);
        } else {
          window.opener.location.hash = navigationHash;
        }
      } else {
        console.log("Navigating opener to PDF notes page with location");
        window.opener.location.href = basePath + navigationHash;
      }

      // Focus the opener window
      window.opener.focus();

      // Close current tab if requested
      if (closeCurrentTab) {
        setTimeout(() => {
          try {
            window.close();
          } catch (closeError) {
            console.warn("Could not close tab:", closeError);
            // If we can't close, navigate away as fallback
            if (fallbackUrl) {
              window.location.href = fallbackUrl + navigationHash;
            }
          }
        }, 200);
      }

      return true;
    }
  } catch (error) {
    console.warn(
      "Direct cross-tab communication failed, trying postMessage:",
      error
    );

    // Try alternative communication methods
    try {
      const navigationData: PostMessageNavigationData = {
        type: "PDF_NAVIGATION",
        page: navigationParams.page,
        coordinates: {
          x: navigationParams.x,
          y: navigationParams.y,
          width: navigationParams.width,
          height: navigationParams.height,
        },
        hash: navigationHash,
      };

      window.opener.postMessage(navigationData, "*");
      console.log("Sent navigation data via postMessage");

      // Focus opener window
      window.opener.focus();

      // Close current tab if requested
      if (closeCurrentTab) {
        setTimeout(() => {
          try {
            window.close();
          } catch (closeError) {
            console.warn("Could not close tab after postMessage:", closeError);
            if (fallbackUrl) {
              window.location.href = fallbackUrl + navigationHash;
            }
          }
        }, 200);
      }

      return true;
    } catch (postMessageError) {
      console.warn("PostMessage communication also failed:", postMessageError);
    }
  }

  // Final fallback for opener window: try to focus without navigation
  try {
    console.log("Attempting basic opener focus");
    window.opener.focus();

    if (closeCurrentTab) {
      setTimeout(() => {
        try {
          window.close();
        } catch (closeError) {
          console.warn("Could not close tab in fallback:", closeError);
          if (fallbackUrl) {
            window.location.href = fallbackUrl + navigationHash;
          }
        }
      }, 100);
    }

    return true;
  } catch (focusError) {
    console.warn("Could not focus opener window:", focusError);
  }

  return false;
}

/**
 * Validates postMessage data for PDF navigation
 */
export function isValidNavigationMessage(
  data: any
): data is PostMessageNavigationData {
  return (
    data &&
    data.type === "PDF_NAVIGATION" &&
    typeof data.page === "number" &&
    data.coordinates &&
    typeof data.coordinates.x === "number" &&
    typeof data.coordinates.y === "number" &&
    typeof data.coordinates.width === "number" &&
    typeof data.coordinates.height === "number" &&
    typeof data.hash === "string"
  );
}
