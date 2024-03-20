import { Button, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";

const CreateGrantOpportunity = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programTypes, setProgramTypes] = useState([]);

  const getData = async () => {
    const programTypes = await CrudService.search("ProgramType", 1000, 1, {});
    const templates = await CrudService.search("Template", 1000, 1, {});
    setProgramTypes([...templates.data.items, ...programTypes.data.items]);
  };

  useEffect(() => {
    if (!user) return;
    getData();
  }, []);

  const onSelect = async (programType) => {
    const program = await CrudService.create("Suite", {
      programType: programType._id,
      name: programType.name,
      description: programType.description,
      published: false,
      isGrantOpportunity: true,
      ...(programType.hasOwnProperty("KPIs") && programType.KPIs.length > 0
        ? { KPIs: programType.KPIs }
        : {}),
      ...(programType.hasOwnProperty("useCase")
        ? { category: programType.useCase }
        : {}),
      ...(programType.hasOwnProperty("strategicGoals")
        ? { strategicGoals: programType.strategicGoals }
        : {}),
      ...(programType.hasOwnProperty("deliveryModel")
        ? { deliveryModel: programType.deliveryModel }
        : {}),
      ...(programType.hasOwnProperty("products")
        ? { products: programType.products }
        : {}),
      ...(programType.hasOwnProperty("impactThemes") &&
      programType.impactThemes.length > 0
        ? { impactThemes: programType.impactThemes }
        : {}),
      ...(programType.hasOwnProperty("objectives")
        ? { objectives: programType.objectives }
        : {}),
    });

    navigate(`/dashboard/grantpre?id=${program.data._id}`);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programTypes.map((programType) => (
            <div
              key={programType._id}
              className="max-w-sm rounded overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out"
            >
              {/*<img className="w-full" src={programType.image} alt="" />*/}
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{programType.name}</div>
                <p className="dark:text-white dark:text-white text-gray-700 text-base">
                  {programType.description}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => onSelect(programType)}
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

export default CreateGrantOpportunity;
