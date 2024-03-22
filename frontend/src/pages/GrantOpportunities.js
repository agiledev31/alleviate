import { Breadcrumb, Divider, Select, Slider } from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { STANDARD_MOMENT_FORMAT, countries } from "../data/constants";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import StrapiService from "../service/StrapiService";
import {
  humanReadableRevenue,
  sectors,
} from "./ngo-company/GrantPreInformation";

const GrantOpportunities = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [text, setText] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    isGrantOpportunity: true,
  });
  const [sort, setSort] = useState({ createdAt: -1 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    StrapiService.getList("impact_categories").then(({ data }) => {
      setCategories(data);
    });
  }, []);

  const fetchPrograms = useCallback(
    async (text = "") => {
      try {
        const data = {
          filters,
          sort,
          text,
        };
        if (user?.role !== "admin") data.filters.published = true;

        const response = await CrudService.search("Suite", limit, page, data);
        setPrograms(response.data.items);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      }
    },
    [filters, sort, page, limit, user]
  );

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Pagination change
  const handlePaginationChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <div className=" p-4">
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/dashboard/grantopportunities">
                  Grant Opportunities
                </Link>
              ),
            },
          ]}
        />

        <div className="bg-white p-6 rounded-md shadow">
          <div className="flex items-center mb-4">
            <input
              className="border p-2 rounded mr-4 flex-grow"
              placeholder="Search by keywords"
              onChange={(e) => setText(e.target.value)}
              value={text}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  setPage(1);
                  fetchPrograms(text);
                }
              }}
            />
            <button
              onClick={() => {
                setPage(1);
                fetchPrograms(text);
              }}
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
            >
              Search
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              Advanced Filters
            </button>
            {showAdvancedFilters && (
              // Add your advanced filters here
              <div className="mt-4">
                {/* Mockup of advanced filters */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Locations
                    </label>
                    <Select
                      className="rounded-full"
                      style={{ width: 250 }}
                      onChange={(value) =>
                        value?.length
                          ? setFilters((f) => ({
                              ...f,
                              "locations.country": { $in: value },
                            }))
                          : setFilters((f) => ({
                              ...f,
                              "locations.country": undefined,
                            }))
                      }
                      value={filters?.["locations.country"]?.$in ?? []}
                      mode={"multiple"}
                    >
                      {countries
                        .sort((a, b) => a.label.localeCompare(b.label))
                        ?.map?.((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Eligible Nationalities
                    </label>
                    <Select
                      className="rounded-full"
                      style={{ width: 250 }}
                      onChange={(value) =>
                        value?.length
                          ? setFilters((f) => ({
                              ...f,
                              "eligibleNationalities.country": { $in: value },
                            }))
                          : setFilters((f) => ({
                              ...f,
                              "eligibleNationalities.country": undefined,
                            }))
                      }
                      value={
                        filters?.["eligibleNationalities.country"]?.$in ?? []
                      }
                      mode={"multiple"}
                    >
                      {countries
                        .sort((a, b) => a.label.localeCompare(b.label))
                        ?.map?.((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Sectors
                    </label>
                    <Select
                      className="rounded-full"
                      style={{ width: 250 }}
                      onChange={(value) =>
                        value?.length
                          ? setFilters((f) => ({
                              ...f,
                              sectors: { $in: value },
                            }))
                          : setFilters((f) => ({
                              ...f,
                              sectors: undefined,
                            }))
                      }
                      value={filters?.["sectors"]?.$in ?? []}
                      mode={"multiple"}
                    >
                      {sectors
                        .sort((a, b) => a.label.localeCompare(b.label))
                        ?.map?.((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Funding Amount
                    </label>

                    <Slider
                      range
                      min={0}
                      max={20000000}
                      step={10000}
                      onChange={(value) =>
                        setFilters((f) => ({
                          ...f,
                          "fundingAmount.0": { $gte: value[0] },
                          "fundingAmount.1": { $lte: value[1] },
                        }))
                      }
                      value={
                        typeof filters?.["fundingAmount.0"]?.$gte ===
                          "number" &&
                        typeof filters?.["fundingAmount.1"]?.$lte === "number"
                          ? [
                              filters?.["fundingAmount.0"]?.$gte,
                              filters?.["fundingAmount.1"]?.$lte,
                            ]
                          : [0, 20000000]
                      }
                      tipFormatter={(value) =>
                        `$${humanReadableRevenue(value)}`
                      }
                    />
                  </div>
                </div>

                <Divider />
              </div>
            )}

            <div className="mt-5 flex justify-between text-xs font-semibold text-gray-700">
              <span>{total} results</span>
              <div className="flex items-center">
                <span className="mr-2">Show:</span>
                <select
                  className="mr-4 rounded-full"
                  onChange={(e) => {
                    setFilters((f) => {
                      const query = {
                        ...f,
                      };

                      if (e.target.value !== "ALL")
                        query.category = e.target.value;
                      else delete query.category;

                      return query;
                    });
                  }}
                >
                  <option value="ALL">All</option>
                  {categories.map((c) => (
                    <option value={c?._id}>{c?.Name}</option>
                  ))}
                  {/* Options */}
                </select>
                <span className="mr-2">Sort by:</span>
                <select
                  className="rounded-full"
                  value={Object.keys(sort)[0]}
                  onChange={(e) => {
                    setSort({ [e.target.value]: -1 });
                  }}
                >
                  <option value="createdAt">Post Date</option>
                  <option value="updatedAt">Modified Date</option>
                </select>
              </div>
            </div>

            <ul className="mt-4">
              {/* Mockup of grant listings */}
              {programs?.map?.((program, index) => (
                <li
                  key={index}
                  className="bg-white my-2 p-4 rounded-lg shadow-md"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      navigate(`/dashboard/grantdetail?id=${program._id}`);
                    }}
                  >
                    <div>
                      <h3 className="font-bold text-lg">{program?.name}</h3>
                      {program?.locations?.length > 0 && (
                        <p className="text-sm">
                          Location:{" "}
                          {program?.locations
                            ?.map?.(
                              (a) =>
                                countries.find(
                                  (c) => c.value === a?.country ?? "US"
                                )?.label
                            )
                            ?.join?.(", ")}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="w-full">
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor="application-deadline"
                        >
                          Application Deadline
                        </label>
                        <p id="application-deadline" className="text-gray-700">
                          {moment(program?.applicationDeadline).format(
                            STANDARD_MOMENT_FORMAT
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <span>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <div className="flex gap-3 text-indigo-500 font-semibold">
            <button
              onClick={() => handlePaginationChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => handlePaginationChange(page + 1)}
              disabled={page >= total / limit}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GrantOpportunities;
