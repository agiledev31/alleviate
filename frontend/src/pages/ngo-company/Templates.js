import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";

const Templates = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMoreTemplates = async () => {
    setLoading(true);
    try {
      const response = await CrudService.search("Template", 9, page, {});
      const newTemplates = response.data.items;
      setTemplates((prevTemplates) => [...prevTemplates, ...newTemplates]);
      setPage((prevPage) => prevPage + 1);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadMoreTemplates();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const container = document.getElementById("templateContainer");

      if (
        container &&
        window.innerHeight + window.scrollY >= container.scrollHeight - 100
      ) {
        loadMoreTemplates();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, loading]);

  return (
    <>
      <div className="container mx-auto p-4" id="templateContainer">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((templateType) => (
            <div
              key={templateType._id}
              className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out"
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-xl mb-2">
                    {templateType.name}
                  </div>
                </div>
                <p className="dark:text-white dark:text-white text-gray-700 text-base">
                  {templateType.description}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  onClick={async () => {
                    navigate(
                      `/dashboard/templatedetails?id=${templateType._id}`
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

export default Templates;
