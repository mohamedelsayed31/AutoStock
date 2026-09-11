import axios from "axios";

import {
  useState,
} from "react";

import {
  Search,
  Car,
} from "lucide-react";

import {
  decodeVin,
} from "../../services/vinService";

import type {
  VinDecodeResult,
} from "../../types/vin";


function VinDecoderPage() {
  const [vin, setVin] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState<VinDecodeResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");
      setResult(null);


      const cleanVin =
        vin.trim().toUpperCase();


      if (cleanVin.length !== 17) {
        setError(
          "VIN must contain exactly 17 characters."
        );

        return;
      }


      setLoading(true);


      try {
        const data =
          await decodeVin(cleanVin);

        setResult(data);
      }
      catch (error) {
        if (
          axios.isAxiosError(error)
        ) {
          setError(
            error.response?.data
              ?.detail ||
            "Failed to decode VIN."
          );
        }
        else {
          setError(
            "Failed to decode VIN."
          );
        }
      }
      finally {
        setLoading(false);
      }
    };


  return (
    <div className="vin-page">

      <div className="vin-header">
        <h1>
          VIN Decoder
        </h1>

        <p>
          Decode vehicle information
          using the NHTSA vPIC service.
        </p>
      </div>


      <form
        className="vin-search-card"
        onSubmit={handleSubmit}
      >

        <label>
          Vehicle Identification Number
        </label>


        <div className="vin-search-row">

          <input
            type="text"
            value={vin}
            maxLength={17}
            placeholder="Enter 17-character VIN"
            onChange={(event) =>
              setVin(
                event.target.value
                  .toUpperCase()
              )
            }
            required
          />


          <button
            type="submit"
            disabled={loading}
          >
            <Search size={18} />

            {loading
              ? "Decoding..."
              : "Decode VIN"}
          </button>

        </div>


        <small>
          {vin.length}/17 characters
        </small>

      </form>


      {error && (
        <p className="error">
          {error}
        </p>
      )}


      {result && (
        <div className="vin-result-card">

          <div className="vin-result-header">

            <Car size={26} />

            <div>
              <h2>
                {result.make}{" "}
                {result.model}
              </h2>

              <p>
                VIN: {result.vin}
              </p>
            </div>

          </div>


          <div className="vin-details-grid">

            <div>
              <span>
                Manufacturer
              </span>

              <strong>
                {result.make || "-"}
              </strong>
            </div>


            <div>
              <span>
                Model
              </span>

              <strong>
                {result.model || "-"}
              </strong>
            </div>


            <div>
              <span>
                Model Year
              </span>

              <strong>
                {result.modelYear || "-"}
              </strong>
            </div>


            <div>
              <span>
                Body Class
              </span>

              <strong>
                {result.bodyClass || "-"}
              </strong>
            </div>


            <div>
              <span>
                Fuel Type
              </span>

              <strong>
                {result.fuelTypePrimary || "-"}
              </strong>
            </div>


            <div>
              <span>
                Transmission
              </span>

              <strong>
                {result.transmissionStyle || "-"}
              </strong>
            </div>


            <div>
              <span>
                Country
              </span>

              <strong>
                {result.plantCountry || "-"}
              </strong>
            </div>


            <div>
              <span>
                Error Code
              </span>

              <strong>
                {result.errorCode || "0"}
              </strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}


export default VinDecoderPage;