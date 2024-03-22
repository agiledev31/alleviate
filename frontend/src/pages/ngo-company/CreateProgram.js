import { Button, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";

const CreateProgram = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programTypes, setProgramTypes] = useState([]);
  useEffect(() => {
    if (!user) return;

    CrudService.search("ProgramType", 1000, 1, {}).then((e) => {
      setProgramTypes(e.data.items);
    });
  }, [user]);
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programTypes.map((programType) => (
            <div
              key={programType._id}
              className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out"
            >
              <img className="w-full" src={programType.image} alt="" />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{programType.name}</div>
                <p className="dark:text-white dark:text-white text-gray-700 text-base">
                  {programType.description}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <button
                  className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded"
                  onClick={async () => {
                    const program = await CrudService.create("Program", {
                      programType: programType._id,
                      name: programType.name,
                      description: programType.description,
                      image: programType.image,
                      published: false,
                    });
                    navigate(`/dashboard/programpre?id=${program.data._id}`);
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CreateProgram;
