import { Menu, Transition } from "@headlessui/react";
import { BarsArrowUpIcon } from "@heroicons/react/24/outline";
import { Skeleton, Tooltip } from "antd";
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
  // const [programTypes, setProgramTypes] = useState([]);

  useEffect(() => {
    StrapiService.getList("impact_categories").then(({ data }) =>
      setCategories(data)
    );
  }, []);

  const loadMorePrograms = useCallback(
    async (filters = {}, text = "") => {
      setLoading(true);
      try {
        const data = {
          filters: { published: true, ...filters },
        };
        if (text) data.text = text;
        data.filters.isGrantOpportunity = true;
        const response = await CrudService.search("Suite", 9, page, data);

        const hasInvitedEmails = response.data.items.some(
          (program) =>
            program.invitedEmails && program.invitedEmails.includes(user.email)
        );
        if (hasInvitedEmails) {
          const data = {
            filters: {
              published: true,
              ...filters,
              invitedEmails: { $in: [user.email] },
            },
          };
          const updatedResponse = await CrudService.search("Suite", 9, page, {
            filters: { published: true, isGrantOpportunity: true },
          });
          const newPrograms = updatedResponse.data.items;
          setPrograms((prevPrograms) => [...prevPrograms, ...newPrograms]);
          setPage((prevPage) => prevPage + 1);
        } else {
          const newPrograms = response.data.items;
          setPrograms((prevPrograms) => [...prevPrograms, ...newPrograms]);
          setPage((prevPage) => prevPage + 1);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    if (!user) return;
    const filter = {};

    // if (typeFilter !== "ALL") {
    //   loadMorePrograms({ programType: typeFilter });
    // } else {
    //   loadMorePrograms();
    // }

    if (typeFilter !== "ALL") {
      filter.category = typeFilter;
    } else {
      Object.keys(filter).forEach((key) => delete filter[key]);
    }
    loadMorePrograms(filter);
  }, [user, typeFilter]);

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

  // Function to perform the actual search
  const performSearch = useCallback(
    (text) => {
      setPage(1);
      setPrograms([]);

      const query = {};
      if (typeFilter !== "ALL") query.programType = typeFilter;

      loadMorePrograms(query, text);
    },
    [typeFilter]
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

  return (
    <>
      <div className="relative mt-2 flex items-center">
        <input
          type="text"
          id="search"
          placeholder="Search Grant Opportunities"
          className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={searchTerm}
          onChange={handleInputChange}
        />

        <Menu as="div" className="relative ml-3">
          <div style={{ width: "max-content" }}>
            <Menu.Button
              type="button"
              className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <BarsArrowUpIcon
                className="-ml-0.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Category:{" "}
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {[{ _id: "ALL", Name: "All" }, ...categories].map((item) => (
                <Menu.Item key={item._id}>
                  {({ active }) => (
                    <div
                      className={classNames(
                        active || typeFilter === item._id ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700 cursor-pointer"
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

                    {/*{programType && programType.hasOwnProperty('isFavorite') && programType.isFavorite ? (*/}
                    {/*    <MdFavorite*/}
                    {/*        className={'mx-1 cursor-pointer'}*/}
                    {/*        stroke={'red'}*/}
                    {/*        color={'red'}*/}
                    {/*        size={22}*/}
                    {/*        onClick={async (value) => {*/}
                    {/*            setPrograms((prevPrograms) =>*/}
                    {/*                prevPrograms.map((p) =>*/}
                    {/*                    p._id === programType._id*/}
                    {/*                        ? { ...p, isFavorite: false }*/}
                    {/*                        : p*/}
                    {/*                )*/}
                    {/*            );*/}
                    {/*            await CrudService.update("Suite", programType._id, {*/}
                    {/*                isFavorite: false,*/}
                    {/*            })*/}
                    {/*            .then((res) => {*/}
                    {/*                if (res.data) {*/}
                    {/*                }*/}
                    {/*            })*/}
                    {/*            .catch((error) => {*/}
                    {/*                setPrograms((prevPrograms) =>*/}
                    {/*                    prevPrograms.map((p) =>*/}
                    {/*                        p._id === programType._id*/}
                    {/*                            ? { ...p, isFavorite: false }*/}
                    {/*                            : p*/}
                    {/*                    )*/}
                    {/*                );*/}
                    {/*            });*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*) : (*/}
                    {/*    <MdFavoriteBorder*/}
                    {/*        className={'mx-1 cursor-pointer'}*/}
                    {/*        stroke={'red'}*/}
                    {/*        size={22}*/}
                    {/*        onClick={async (value) => {*/}
                    {/*            setPrograms((prevPrograms) =>*/}
                    {/*                prevPrograms.map((p) =>*/}
                    {/*                    p._id === programType._id*/}
                    {/*                        ? { ...p, isFavorite: true }*/}
                    {/*                        : p*/}
                    {/*                )*/}
                    {/*            );*/}
                    {/*            await CrudService.update("Suite", programType._id, {*/}
                    {/*                isFavorite: true,*/}
                    {/*            })*/}
                    {/*                .then((res) => {*/}
                    {/*                    if (res.data) {*/}
                    {/*                    }*/}
                    {/*                })*/}
                    {/*                .catch((error) => {*/}
                    {/*                    setPrograms((prevPrograms) =>*/}
                    {/*                        prevPrograms.map((p) =>*/}
                    {/*                            p._id === programType._id*/}
                    {/*                                ? { ...p, isFavorite: true }*/}
                    {/*                                : p*/}
                    {/*                        )*/}
                    {/*                    );*/}
                    {/*                });*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*)}*/}
                  </Tooltip>
                </div>
                <p className="text-gray-700 text-base">
                  {programType.description}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    navigate(`/dashboard/suitedetail?id=${programType._id}`);
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
