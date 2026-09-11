import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  History,
} from "lucide-react";

import {
  getCarById,
} from "../../services/carService";

import {
  getStockHistory,
} from "../../services/stockService";

import type {
  Car,
} from "../../types/car";

import type {
  StockTransaction,
} from "../../types/stock";


function CarStockHistoryPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();


  const [
    car,
    setCar,
  ] = useState<Car | null>(
    null
  );

  const [
    transactions,
    setTransactions,
  ] = useState<
    StockTransaction[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    const loadData =
      async () => {

        if (!id) {
          setError(
            "Invalid car ID."
          );

          setLoading(false);

          return;
        }


        const carId =
          Number(id);


        if (
          Number.isNaN(carId)
        ) {
          setError(
            "Invalid car ID."
          );

          setLoading(false);

          return;
        }


        try {
            const [
                carData,
                historyData,
              ] =
                await Promise.all([
                  getCarById(
                    carId
                  ),
              
                  getStockHistory({
                    carId,
                    page: 1,
                    pageSize: 100,
                  }),
                ]);


          setCar(
            carData
          );

          setTransactions(
            historyData.items
          );
        }
        catch (error) {

          if (
            axios.isAxiosError(
              error
            ) &&
            error.response
              ?.status === 404
          ) {
            setError(
              "Car not found."
            );

            return;
          }


          setError(
            "Failed to load stock history."
          );
        }
        finally {
          setLoading(false);
        }
      };


    loadData();

  }, [id]);


  const getTransactionClass = (
    transactionType: string
  ) => {

    const type =
      transactionType
        .toLowerCase();


    if (
      type.includes("in")
    ) {
      return "transaction-in";
    }


    if (
      type.includes("out")
    ) {
      return "transaction-out";
    }


    return "";
  };


  if (loading) {
    return (
      <p>
        Loading stock history...
      </p>
    );
  }


  if (
    error ||
    !car
  ) {
    return (
      <div>

        <p className="error">
          {error ||
            "Stock history is unavailable."}
        </p>


        <button
          onClick={() =>
            navigate("/cars")
          }
        >
          Back to Cars
        </button>

      </div>
    );
  }


  return (
    <div className="stock-history-page">

      <div className="stock-history-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate(
                `/cars/${car.id}`
              )
            }
          >
            <ArrowLeft
              size={17}
            />

            Back to Car
          </button>


          <h1>
            Stock History
          </h1>


          <p>
            {car.brandName}{" "}
            {car.model}
          </p>

        </div>


        <div className="history-summary">

          <History
            size={22}
          />

          <div>
            <span>
              Total Transactions
            </span>

            <strong>
              {
                transactions.length
              }
            </strong>
          </div>

        </div>

      </div>


      {transactions.length ===
        0 && (

        <div className="empty-state">

          <History
            size={35}
          />

          <h3>
            No stock transactions
          </h3>

          <p>
            This car does not
            have any stock
            transactions yet.
          </p>

        </div>
      )}


      {transactions.length >
        0 && (

        <div className="table-container">

          <table>

            <thead>
              <tr>

                <th>ID</th>

                <th>
                  Type
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Date
                </th>

                <th>
                  Notes
                </th>

              </tr>
            </thead>


            <tbody>

              {transactions.map(
                (
                  transaction
                ) => (

                  <tr
                    key={
                      transaction.id
                    }
                  >

                    <td>
                      {
                        transaction.id
                      }
                    </td>


                    <td>

                      <span
                        className={
                          `transaction-badge ${getTransactionClass(
                            transaction
                              .transactionType
                          )}`
                        }
                      >
                        {
                          transaction
                            .transactionType
                        }
                      </span>

                    </td>


                    <td>
                      {
                        transaction
                          .quantity
                      }
                    </td>


                    <td>
                      {new Date(
                        transaction
                          .transactionDate
                      ).toLocaleString()}
                    </td>


                    <td>
                      {
                        transaction
                          .notes ||
                        "-"
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}


export default CarStockHistoryPage;