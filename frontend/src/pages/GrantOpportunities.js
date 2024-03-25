import { Menu, Transition } from "@headlessui/react";
import { Breadcrumb, Divider, Select, Slider, Space } from "antd";
import moment from "moment";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { FaRegSave } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
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
  const [savedSearches, setSavedSearches] = useState([]);

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

  const saveCurrentSearch = useCallback(async () => {
    const searchCriteria = {
      filters,
      sort,
    };

    try {
      await CrudService.create("SavedSearchGrantOpp", searchCriteria);
      await fetchUserSavedSearches();
    } catch (error) {}
  }, [filters, sort]);

  const fetchUserSavedSearches = useCallback(async () => {
    if (!user) return;
    try {
      const response = await CrudService.search(
        "SavedSearchGrantOpp",
        100000,
        1,
        {
          filters: { user_id: user._id },
          sort: { createdAt: -1 },
        }
      );
      setSavedSearches(response.data.items);
    } catch (error) {
      console.error("Failed to fetch saved searches", error);
    }
  }, [user]);
  useEffect(() => {
    fetchUserSavedSearches();
  }, [fetchUserSavedSearches]);

  const deleteSavedSearch = async (savedSearchId) => {
    try {
      await CrudService.delete("SavedSearchGrantOpp", savedSearchId);
      await fetchUserSavedSearches();
    } catch (error) {
      console.error("Failed to delete saved search", error);
    }
  };

  const loadSavedSearch = (search) => {
    setSort(search.sort);
    setFilters(search.filters);
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
              className="border p-2 rounded flex-grow"
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
              className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded"
            >
              Search
            </button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
              >
                Advanced Filters
              </button>

              <div>
                <Space size={0}>
                  <button
                    style={{
                      border: "solid 1px",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    onClick={saveCurrentSearch}
                  >
                    <FaRegSave />
                  </button>
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button
                        style={{
                          border: "solid 1px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                        }}
                        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        <FaAngleDown />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {savedSearches.map((search) => (
                            <Menu.Item key={search._id}>
                              {({ active }) => (
                                <a
                                  href="#"
                                  onClick={() => loadSavedSearch(search)}
                                  className={`${
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700"
                                  } flex justify-between w-full px-4 py-2 text-sm`}
                                >
                                  {search.searchTerm ||
                                    moment(search.createdAt).format(
                                      STANDARD_MOMENT_FORMAT
                                    ) ||
                                    "Unnamed Search"}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent loading the search when attempting to delete
                                      deleteSavedSearch(search._id);
                                    }}
                                    className={`${
                                      active ? "text-gray-900" : "text-gray-400"
                                    } ml-2 hover:text-gray-600`}
                                  >
                                    &#x2715;{" "}
                                    {/* This is a 'X' character for the delete button */}
                                  </button>
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </Space>
              </div>
            </div>

            {showAdvancedFilters && (
              // Add your advanced filters here
              <div className="mt-4">
                {/* Mockup of advanced filters */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Locations
                    </label>
                    <div className="flex gap-1 items-center">
                      <ReactFlagsSelect
                        className="min-w-[250px] w-full flex-grow rounded-full"
                        onSelect={(value) =>
                          value?.length
                            ? setFilters((f) => ({
                                ...f,
                                "locations.country": { $in: [value] },
                              }))
                            : setFilters((f) => ({
                                ...f,
                                "locations.country": undefined,
                              }))
                        }
                        selected={filters?.["locations.country"]?.$in?.[0]}
                        searchable
                      />
                      <button
                        style={{
                          border: "solid 1px",
                        }}
                        className="inline-flex justify-center  rounded-md border border-gray-300 shadow-sm px-4 py-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        onClick={() => {
                          setFilters((f) => ({
                            ...f,
                            "locations.country": undefined,
                          }));
                        }}
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Eligible Nationalities
                    </label>
                    <div className="flex gap-1 items-center">
                      <ReactFlagsSelect
                        className="min-w-[250px] w-full flex-grow rounded-full"
                        onSelect={(value) =>
                          value?.length
                            ? setFilters((f) => ({
                                ...f,
                                "eligibleNationalities.country": {
                                  $in: [value],
                                },
                              }))
                            : setFilters((f) => ({
                                ...f,
                                "eligibleNationalities.country": undefined,
                              }))
                        }
                        selected={
                          filters?.["eligibleNationalities.country"]?.$in?.[0]
                        }
                        searchable
                      />
                      <button
                        style={{
                          border: "solid 1px",
                        }}
                        className="inline-flex justify-center  rounded-md border border-gray-300 shadow-sm px-4 py-4 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        onClick={() => {
                          setFilters((f) => ({
                            ...f,
                            "eligibleNationalities.country": undefined,
                          }));
                        }}
                      >
                        <RxCross2 />
                      </button>
                    </div>
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

            <div className="mt-5 md:flex justify-between items-center text-xs font-semibold text-gray-700">
              <span>{total} results</span>
              <div className="md:flex items-center">
                <div className="mt-2 md:mt-0">
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
                </div>
                <div className="mt-2 md:mt-0">
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
