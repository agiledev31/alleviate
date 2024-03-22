import { Menu, Transition } from "@headlessui/react";
import { BarsArrowUpIcon } from "@heroicons/react/24/outline";
import { Button, Skeleton, Switch, Tooltip, Typography } from "antd";
import classNames from "classnames";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ExcelImport from "../../components/ExcelImport";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";
import StrapiService from "../../service/StrapiService";
const { Paragraph, Text } = Typography;

const MyPrograms = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedMap, setExpandedMap] = useState({});
  const [categories, setCategories] = useState([]);
  const [programStatus, setProgramStatus] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    setProgramStatus([
      { _id: "ALL", name: "All" },
      { _id: "published", name: "Published" },
      { _id: "unPublished", name: "Unpublished" },
    ]);
    StrapiService.getList("impact_categories").then(({ data }) =>
      setCategories(data)
    );
  }, []);

  useEffect(() => {
    if (user?.role == "ngo-beneficiary") {
      setStatusFilter("published");
    }
  }, [user, window.location.href]);

  const loadMorePrograms = async (filters = {}, text = "") => {
    setLoading(true);
    try {
      const data = {
        filters: { ...filters },
        sort: { createdAt: -1 },
      };
      // if (text) data.text = text;
      if (text) {
        data.filters.name = { $regex: text };
      }
      data.filters.isGrantOpportunity = false;
      const programRes = await CrudService.search("Suite", 25, page, data);
      setPrograms(programRes.data.items);
      console.log("programRes", programRes);
      if (user?.role !== "ngo-beneficiary") {
        setPrograms(programRes.data.items);
      } else {
        setPrograms(programRes.data.items);
        setStatusFilter("published");
        if (window.location.href.includes("myapplications")) {
          setStatusFilter("unPublished");
          //   setPrograms(
          //     programRes.data.items.filter(async (item) => {
          //       const assessmentRes = await CrudService.search("ProgramSubmission", 1, 1, {
          //         filters: {
          //           suite: item._id,
          //           isDefaultAssessment: false,
          //           status: "approve"
          //         },
          //       });
          //       return !!assessmentRes.data.length;
          //     })
          //   )
        } else {
          setStatusFilter("unPublished");
          //   setPrograms(
          //     programRes.data.items.filter(async (item) => {
          //       const assessmentRes = await CrudService.search("ProgramSubmission", 1, 1, {
          //         filters: {
          //           suite: item._id,
          //           isDefaultAssessment: false,
          //           status: "approve"
          //         },
          //       });
          //       return !!assessmentRes.data.length;
          //     })
          //   )
        }
      }

      // const newPrograms = response.data.items;
      // setPrograms((prevPrograms) => [...prevPrograms, ...newPrograms]);
      // setPage((prevPage) => prevPage + 1);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const filter = {};

    if (statusFilter !== "ALL") {
      filter.published = statusFilter === "published";
    }

    if (categoryFilter !== "ALL") {
      filter.category = categoryFilter;
    }

    if (statusFilter === "ALL" && categoryFilter === "ALL") {
      Object.keys(filter).forEach((key) => delete filter[key]);
    }
    loadMorePrograms(filter, searchTerm);
  }, [user, statusFilter, categoryFilter]);

  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const container = document.getElementById("programContainer");

      if (
        container &&
        window.innerHeight + window.scrollY >= container.scrollHeight - 100
      ) {
        loadMorePrograms();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, loading]);

  const toggleExpanded = (programId) => {
    setExpandedMap((prevMap) => ({
      ...prevMap,
      [programId]: !prevMap[programId],
    }));
  };

  const shouldShowReadMore = (program) =>
    program.description.length > 400 && !expandedMap[program._id];

  const truncatedDescription = (program) => program.description.slice(0, 400);

  const performSearch = useCallback(
    (text) => {
      setPage(1);
      setPrograms([]);

      const query = {};
      if (statusFilter !== "ALL")
        query.published = statusFilter === "published";
      if (categoryFilter !== "ALL") query.category = categoryFilter;
      if (statusFilter === "ALL" && categoryFilter === "ALL") {
        Object.keys(query).forEach((key) => delete query[key]);
      }
      loadMorePrograms(query, text);
    },
    [statusFilter, categoryFilter]
  );

  const searchTimer = useRef();
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);

    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, 2000);
  };

  return (
    <>
      <div className="relative mb-3 flex items-center">
        <input
          type="text"
          id="search"
          placeholder="Search Programs"
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
              Category:{" "}
              {categoryFilter !== "ALL"
                ? categories.find((item) => item._id === categoryFilter)?.Name
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
                        active || categoryFilter === item._id
                          ? "bg-gray-100"
                          : "",
                        "block px-4 py-2 text-sm dark:text-white text-gray-700 cursor-pointer"
                      )}
                      onClick={() => {
                        setPage(1);
                        setPrograms([]);
                        setCategoryFilter(item._id);
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

        {user?.role !== "ngo-beneficiary" && (
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
                Status:{" "}
                {programStatus.find((item) => item._id === statusFilter)?.name}
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
                {programStatus.map((item) => (
                  <Menu.Item key={item._id}>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active || statusFilter === item._id
                            ? "bg-gray-100"
                            : "",
                          "block px-4 py-2 text-sm dark:text-white text-gray-700 cursor-pointer"
                        )}
                        onClick={() => {
                          setPage(1);
                          setPrograms([]);
                          setStatusFilter(item._id);
                        }}
                      >
                        {item.name}
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
      {user?.role !== "ngo-beneficiary" && (
        <Button
          type="primary"
          className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
          onClick={() => {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
          }}
        >
          Import Programs
        </Button>
      )}
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
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-xl mb-2">
                    {programType.name}
                  </div>
                  <div className="flex items-center justify-between">
                    {user?.role !== "ngo-beneficiary" && (
                      <Tooltip
                        title={
                          programType.published ? "Published" : "Unpublished"
                        }
                      >
                        <Switch
                          size="small"
                          checked={programType.published}
                          onChange={async (value) => {
                            setPrograms((prevPrograms) =>
                              prevPrograms.map((p) =>
                                p._id === programType._id
                                  ? { ...p, published: value }
                                  : p
                              )
                            );
                            await CrudService.update("Suite", programType._id, {
                              published: value,
                              isPublished: value === true,
                            })
                              .then((res) => {
                                if (res.data) {
                                }
                              })
                              .catch((error) => {
                                setPrograms((prevPrograms) =>
                                  prevPrograms.map((p) =>
                                    p._id === programType._id
                                      ? { ...p, published: !value }
                                      : p
                                  )
                                );
                              });
                          }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      title={
                        programType.hasOwnProperty("favoriteBy") &&
                        programType?.favoriteBy?.includes(user._id)
                          ? "Remove from Favorite"
                          : "Add to Favorite"
                      }
                    >
                      {programType &&
                      programType.hasOwnProperty("favoriteBy") &&
                      programType?.favoriteBy.includes(user._id) ? (
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
                            }).then((res) => {});
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
                            }).then((res) => {});
                          }}
                        />
                      )}
                    </Tooltip>
                  </div>
                </div>
                <Paragraph
                  className="dark:text-white dark:text-white text-gray-700 text-base m-0"
                  ellipsis={{
                    rows: 500,
                    expandable: false,
                  }}
                >
                  {expandedMap[programType._id] ||
                  !shouldShowReadMore(programType) ? (
                    programType.description
                  ) : (
                    <>
                      {truncatedDescription(programType)}
                      {shouldShowReadMore(programType) && (
                        <>
                          ...
                          <span
                            className="cursor-pointer text-primary"
                            onClick={() => toggleExpanded(programType._id)}
                          >
                            {" "}
                            Read more
                          </span>
                        </>
                      )}
                    </>
                  )}
                </Paragraph>
              </div>
              <div className="px-6 pt-1 pb-2">
                <button
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                  onClick={async () => {
                    navigate(`/dashboard/suitedetails?id=${programType._id}`);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExcelImport
        modalName={"Suite"}
        targetMapping={[
          {
            value: "programType",
            label: "programType",
            type: "string",
          },
          {
            value: "published",
            label: "published",
            type: "boolean",
          },
          {
            value: "name",
            label: "name",
            type: "string",
            required: true,
          },
          {
            value: "description",
            label: "description",
            type: "string",
          },
          {
            value: "category",
            label: "category",
            type: "string",
          },
          {
            value: "startDate",
            label: "startDate",
            type: "string",
          },
          {
            value: "endDate",
            label: "endDate",
            type: "string",
          },
          {
            value: "objectives",
            label: "objectives",
            type: "string",
          },
          {
            value: "image",
            label: "image",
            type: "string",
          },
          {
            value: "listedForNGOBeneficiaries",
            label: "listedForNGOBeneficiaries",
            type: "boolean",
          },
          {
            value: "listedForDonors",
            label: "listedForDonors",
            type: "boolean",
          },
          {
            value: "listedForExperts",
            label: "listedForExperts",
            type: "boolean",
          },
        ]}
        handleImport={async (e) => {
          const defaultAssessments = await CrudService.search(
            "DefaultAssessment",
            1,
            1,
            { sort: { createdAt: 1 } }
          );
          const defaultAssessment = defaultAssessments.data.items?.[0];

          await Promise.all(
            e.mappedItems.map(async (item) => {
              const program = await CrudService.create("Suite", {
                ...item,
                published: false,
                isGrantOpportunity: false,
              });

              // Create default assessment
              if (defaultAssessment)
                await CrudService.create("Program", {
                  suite: program.data._id,
                  name: defaultAssessment.name,
                  description: defaultAssessment.description,
                  published: true,
                  assessmentType: "enrollment",
                  isDefaultAssessment: true,
                  form: defaultAssessment.form,
                });
            })
          );

          window.location.reload();
        }}
        fileInputRef={fileInputRef}
      />
    </>
  );
};

export default MyPrograms;
