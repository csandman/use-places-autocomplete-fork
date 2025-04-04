import { describe, it, expect, vi } from "vitest";
import { getDetailsErr, getDetails } from "../utils";

const data = { formatted_address: "123", name: "abc" };
const error = "ERROR";
const request = { placeId: "0109", fields: ["name", "rating"] };
const getDetailsFn = vi.fn();

const setupMaps = (type = "success") => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        PlacesService: class {
          getDetails =
            type === "request"
              ? getDetailsFn
              : (_: any, cb: (dataArg: any, status: string) => void) => {
                  cb(
                    type === "success" ? data : null,
                    type === "success" ? "OK" : error
                  );
                };
        },
      },
    },
  };
};

describe("getDetails", () => {
  it("should make call with request passed in", () => {
    setupMaps("request");
    getDetails(request);
    expect(getDetailsFn).toHaveBeenCalledWith(request, expect.any(Function));
  });

  it("should handle success correctly", () => {
    setupMaps();
    return getDetails(request).then((results) => expect(results).toBe(data));
  });

  it("should throw error when place_id is not provided", async () => {
    console.error = vi.fn();

    setupMaps();
    let err;
    try {
      // @ts-ignore
      await getDetails({});
    } catch (someErr) {
      err = someErr;
    }
    expect(console.error).toHaveBeenCalledWith(getDetailsErr);
    expect(err).toBe(getDetailsErr);
  });

  it("should handle failure correctly", async () => {
    setupMaps("failure");
    let err;
    try {
      await getDetails(request);
    } catch (someErr) {
      err = someErr;
    }
    expect(err).toBe(error);
  });
});
