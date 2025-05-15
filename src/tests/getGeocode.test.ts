import { describe, it, expect, vi } from "vitest";
import { getGeocode, geocodeErr } from "../utils";

const data = [{ place_id: "0109" }];
const error = "ERROR";
const geocode = vi.fn();
const setupMaps = (type = "success") => {
  globalThis.google = {
    maps: {
      // @ts-ignore
      Geocoder: class {
        geocode =
          type === "opts"
            ? geocode
            : (_: any, cb: (dataArg: any, status: string) => void) => {
                cb(
                  type === "success" ? data : null,
                  type === "success" ? "OK" : error
                );
              };
      },
    },
  };
};

describe("getGeocode", () => {
  it("should set options correctly", () => {
    setupMaps("opts");
    const opts = { address: "Taipei", placeId: "0109" };
    getGeocode(opts);
    expect(geocode).toHaveBeenCalledWith(opts, expect.any(Function));
  });

  it("should handle success correctly", () => {
    setupMaps();
    return getGeocode({ address: "Taipei" }).then((results) =>
      expect(results).toBe(data)
    );
  });

  it("should handle failure correctly", async () => {
    setupMaps("failure");
    let err;
    try {
      await getGeocode({ address: "Taipei" });
    } catch (someErr) {
      err = someErr;
    }
    expect(err).toBe(error);
  });

  it("should restrict the result to Taiwan and fail", async () => {
    setupMaps("failure");
    let err;
    try {
      await getGeocode({
        address: "Belgrade",
        componentRestrictions: { country: "TW" },
      });
    } catch (someErr) {
      err = someErr;
    }
    expect(err).toBe(error);
  });

  it("should restrict the result to Taiwan and pass", () => {
    setupMaps();
    return getGeocode({
      address: "Taipei",
      componentRestrictions: { country: "TW" },
    }).then((results) => expect(results).toBe(data));
  });

  it("should throw error when providing componentRestrictions without address", () => {
    console.error = vi.fn();

    setupMaps();
    return getGeocode({
      componentRestrictions: { country: "TW", postalCode: "100" },
    }).then((results) => {
      expect(console.error).toHaveBeenCalledWith(geocodeErr);
      expect(results).toBe(data);
      return null;
    });
  });
});
