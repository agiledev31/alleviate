import { Menu, Transition } from "@headlessui/react";
import { BarsArrowUpIcon } from "@heroicons/react/24/outline";
import { DatePicker, InputNumber, Skeleton, Space, Tooltip } from "antd";
import classNames from "classnames";
import dayjs from "dayjs";
import moment from "moment";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaRegSave } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { STANDARD_MOMENT_FORMAT } from "../data/constants";
import { selectUser } from "../redux/auth/selectors";
import CrudService from "../service/CrudService";
import StrapiService from "../service/StrapiService";

const GrantOpportunities = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [minFunding, setMinFunding] = useState();
  const [maxFunding, setMaxFunding] = useState();
  const [deadlineStart, setDeadlineStart] = useState();
  const [deadlineEnd, setDeadlineEnd] = useState();

  useEffect(() => {
    StrapiService.getList("impact_categories").then(({ data }) =>
      setCategories(data)
    );
  }, []);

  const loadMorePrograms = useCallback(
    async (filters = {}, text = "", refresh = true) => {
      setLoading(true);
      try {
        const data = {
          filters: {
            published: true,
            isGrantOpportunity: true,
            ...filters,
          },
        };
        if (text) data.text = text;
        data.filters.isGrantOpportunity = true;
        const response = await CrudService.search("Suite", 9, page, data);

        const newPrograms = response.data.items;
        setPrograms((prevPrograms) => [
          ...(refresh ? [] : prevPrograms),
          ...newPrograms,
        ]);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    if (!user) return;
    const filter = {
      ...(minFunding ? { fundingAmount: { $gte: minFunding } } : {}),
      ...(maxFunding ? { fundingAmount: { $lte: maxFunding } } : {}),
      ...(deadlineStart
        ? {
            startDate: { $gte: new Date(deadlineStart) },
          }
        : {}),
      ...(deadlineEnd ? { endDate: { $lte: new Date(deadlineEnd) } } : {}),
    };

    if (typeFilter !== "ALL") {
      filter.category = typeFilter;
    }
    loadMorePrograms(filter);
  }, [user, typeFilter, minFunding, maxFunding, deadlineStart, deadlineEnd]);

  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const container = document.getElementById("programContainer");

      if (
        container &&
        window.innerHeight + window.scrollY >= container.scrollHeight - 100
      ) {
        loadMorePrograms(undefined, undefined, false);
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, loading]);

  // Function to perform the actual search
  const performSearch = useCallback(
    (text, search) => {
      setPage(1);
      setPrograms([]);

      const minFundingR = search?.minFunding ?? minFunding;
      const maxFundingR = search?.maxFunding ?? maxFunding;
      const deadlineStartR = search?.deadlineStart ?? deadlineStart;
      const deadlineEndR = search?.deadlineEnd ?? deadlineEnd;
      const typeFilterR = search?.typeFilter ?? typeFilter;

      const query = {
        ...(minFundingR ? { fundingAmount: { $gte: minFundingR } } : {}),
        ...(maxFundingR ? { fundingAmount: { $lte: maxFundingR } } : {}),
        ...(deadlineStartR
          ? {
              startDate: { $gte: deadlineStartR },
            }
          : {}),
        ...(deadlineEndR ? { endDate: { $lte: deadlineEndR } } : {}),
      };
      if (typeFilterR !== "ALL") query.programType = typeFilterR;

      loadMorePrograms(query, text);
    },
    [typeFilter, minFunding, maxFunding, deadlineStart, deadlineEnd]
  );

  // Function to handle the input change with debounce
  const searchTimer = useRef();
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);

    // Delay the execution of the search function by 300 milliseconds (adjust as needed)
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, 2000);
  };

  const saveCurrentSearch = useCallback(async () => {
    const searchCriteria = {
      typeFilter,
      minFunding,
      maxFunding,
      deadlineStart,
      deadlineEnd,
      searchTerm,
    };

    try {
      await CrudService.create("SavedSearchGrantOpp", searchCriteria);
      await fetchUserSavedSearches();
    } catch (error) {}
  }, [
    typeFilter,
    minFunding,
    maxFunding,
    deadlineStart,
    deadlineEnd,
    searchTerm,
  ]);

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
    setTypeFilter(search.typeFilter || "ALL");
    setMinFunding(search.minFunding);
    setMaxFunding(search.maxFunding);
    setDeadlineStart(search.deadlineStart);
    setDeadlineEnd(search.deadlineEnd);

    setSearchTerm(search.searchTerm);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      performSearch(search.searchTerm, search);
    }, 2000);
  };

  return (
    <>
      <div className="relative mt-2 flex items-center">
        <input
          type="text"
          id="search"
          placeholder="Search Grant Opportunities"
          className="dark:bg-gray-900 block w-full rounded-md border-0 py-1.5 pr-14 dark:text-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={searchTerm}
          onChange={handleInputChange}
        />

        <Menu as="div" className="relative ml-3">
          <div style={{ width: "max-content" }}>
            <Menu.Button
              type="button"
              className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold dark:text-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <BarsArrowUpIcon
                className="-ml-0.5 h-5 w-5 dark:text-white text-gray-400"
                aria-hidden="true"
              />
              Thematic Area:{" "}
              {typeFilter !== "ALL"
                ? categories.find((item) => item._id === typeFilter)?.Name
                : "All"}
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {[{ _id: "ALL", Name: "All" }, ...categories].map((item) => (
                <Menu.Item key={item._id}>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active || typeFilter === item._id ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm dark:text-white text-gray-700 cursor-pointer"
                      )}
                      onClick={() => {
                        setPage(1);
                        setPrograms([]);
                        setTypeFilter(item._id);
                      }}
                    >
                      {item.Name}
                    </div>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-1 mt-1">
        <InputNumber
          style={{ width: "max-content" }}
          placeholder="Minimum Funding"
          onChange={(value) => setMinFunding(value)}
          value={minFunding}
        />
        <InputNumber
          style={{ width: "max-content" }}
          placeholder="Maximum Funding"
          onChange={(value) => setMaxFunding(value)}
          value={maxFunding}
        />
        <DatePicker
          style={{ width: "max-content" }}
          placeholder="Start Deadline"
          onChange={(date, dateString) => setDeadlineStart(dateString)}
          value={deadlineStart ? dayjs(deadlineStart) : null}
        />
        <DatePicker
          style={{ width: "max-content" }}
          placeholder="End Deadline"
          onChange={(date, dateString) => setDeadlineEnd(dateString)}
          value={deadlineEnd ? dayjs(deadlineEnd) : null}
        />
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

      <div className="container mx-auto p-4" id="programContainer">
        {loading && programs.length <= 0 && <Skeleton active />}
        {!loading && programs.length === 0 && (
          <div className="mt-2">
            <strong>No Data Found</strong>
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((programType) => (
            <div
              key={programType._id}
              className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out"
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-xl mb-2">
                    {programType.name}
                  </div>

                  <Tooltip
                    title={
                      programType?.favoriteBy.includes(user._id)
                        ? "Remove from Favorite"
                        : "Add to Favorite"
                    }
                  >
                    {programType &&
                    programType.hasOwnProperty("favoriteBy") &&
                    programType.favoriteBy.includes(user._id) ? (
                      <MdFavorite
                        className={"mx-1 cursor-pointer"}
                        stroke={"red"}
                        color={"red"}
                        size={22}
                        onClick={async () => {
                          setPrograms((prevPrograms) =>
                            prevPrograms.map((p) =>
                              p._id === programType._id
                                ? {
                                    ...p,
                                    favoriteBy: p.favoriteBy.filter(
                                      (id) => id !== user._id
                                    ),
                                  }
                                : p
                            )
                          );
                          await CrudService.update("Suite", programType._id, {
                            favoriteBy: programType.favoriteBy.filter(
                              (id) => id !== user._id
                            ),
                          })
                            .then((res) => {})
                            .catch((error) => {});
                        }}
                      />
                    ) : (
                      <MdFavoriteBorder
                        className={"mx-1 cursor-pointer"}
                        stroke={"red"}
                        size={22}
                        onClick={async () => {
                          setPrograms((prevPrograms) =>
                            prevPrograms.map((p) =>
                              p._id === programType._id
                                ? {
                                    ...p,
                                    favoriteBy: [...p.favoriteBy, user._id],
                                  }
                                : p
                            )
                          );
                          await CrudService.update("Suite", programType._id, {
                            favoriteBy: [...programType.favoriteBy, user._id],
                          })
                            .then((res) => {})
                            .catch((error) => {});
                        }}
                      />
                    )}
                  </Tooltip>
                </div>
                <p className="dark:text-white dark:text-white text-gray-700 text-base">
                  {programType.description}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2 flex gap-1">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    navigate(
                      `/dashboard/${
                        user.role === "admin"
                          ? "suiteoverviewdetail"
                          : "suitedetail"
                      }?id=${programType._id}`
                    );
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GrantOpportunities;
