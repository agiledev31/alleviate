import { Breadcrumb, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../components/MultiStepComponent";
import CrudService from "../service/CrudService";

const ProgramThankyou = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setProgramData(null);

    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
    });
  }, [searchParams]);

  if (!programData) return <Skeleton active />;
  return (
    <>
      <div style={{ height: "80vh" }}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/dashboard/myprograms">My Programs</Link>,
            },
            {
              title: (
                <Link to={`/dashboard/suitedetails?id=${programData?._id}`}>
                  {programData?.name ?? ""}
                </Link>
              ),
            },
            {
              title: "Submission",
            },
          ]}
        />

        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">Success!</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Thank you!
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Your participation in the program {programData.name} is highly
            appreciated!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/dashboard/myprograms"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Discover further programs
            </Link>
            {/* <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgramThankyou;
