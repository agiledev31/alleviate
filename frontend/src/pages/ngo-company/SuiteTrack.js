import { Button, Collapse, Progress, Skeleton, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectUser } from "../../redux/auth/selectors";
import CrudService from "../../service/CrudService";
const { Panel } = Collapse;

const SuiteTrack = () => {
  let [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [mainProgress, setMainProgress] = useState(0);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!user && !id) return;
    setProgramData(null);

    CrudService.getSingle("Suite", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);
      setSelectedCategoryData(res.data.useCaseStages);
    });
  }, [searchParams]);

  useEffect(() => {
    let totalActions = 0;
    let completedAction = 0;

    if (
      selectedCategoryData &&
      selectedCategoryData.stages.length > 0 &&
      programData
    ) {
      const objectAction = selectedCategoryData.stages[0].actions.find(
        (action) => action.id === "objective"
      );
      const targetAction = selectedCategoryData.stages[0].actions.find(
        (action) => action.id === "target"
      );
      if (objectAction) {
        objectAction.completed =
          programData.category &&
          programData.strategicGoals &&
          programData.products &&
          programData.deliveryModel &&
          programData.impactThemes.length > 0 &&
          programData.objectives;
      }

      if (targetAction) {
        targetAction.completed = programData.startDate && programData.endDate;
      }

      selectedCategoryData.stages.forEach((stage) => {
        let stageTotalActions = 0;
        let stageCompletedActions = 0;

        totalActions += stage.actions.length;
        stage.actions.forEach((action) => {
          if (action.completed) {
            completedAction = completedAction + 1;
            stageCompletedActions += 1;
          }
          stageTotalActions += 1;
        });
        stage.progress =
          stageTotalActions > 0
            ? parseFloat(
                ((stageCompletedActions / stageTotalActions) * 100).toFixed(2)
              )
            : 0;
      });
    }
    const mainProgressData = parseFloat(
      ((completedAction / totalActions) * 100).toFixed(2)
    );
    setMainProgress(mainProgressData);
  }, [selectedCategoryData]);

  const handleStageClick = (stageIndex, actionIndex, action) => {
    if (action.id !== "target" && action.id !== "objective") {
      handleProgressClick(stageIndex, actionIndex);
    }
    if (action.id === "target") {
      navigate(`/dashboard/suitetarget?id=${programData._id}`);
    } else if (action.id === "objective") {
      navigate(`/dashboard/suiteobjective?id=${programData._id}`);
    }

    if (selectedCategoryData.type === "education" && action.id === "baseline") {
      navigate(`/dashboard/suitedetails?id=${programData._id}&action=baseline`);
    }
  };

  const handleProgressClick = async (stageIndex, actionIndex) => {
    const updatedSelectedCategory = { ...selectedCategoryData };

    updatedSelectedCategory.stages[stageIndex].actions[actionIndex].completed =
      !updatedSelectedCategory.stages[stageIndex].actions[actionIndex]
        .completed;

    setSelectedCategoryData(updatedSelectedCategory);

    if (updatedSelectedCategory) {
      const id = searchParams.get("id");

      await CrudService.update("Suite", id, {
        useCaseStages: updatedSelectedCategory,
      }).then((res) => {
        if (!res.data) return;
        setProgramData(res.data);
        setSelectedCategoryData(res.data.useCaseStages);
      });
    }
  };

  const trackCategoriesList = [
    {
      type: "education",
      stages: [
        {
          name: "Goal Setting and Target Setting",
          progress: 0,
          actions: [
            {
              id: "objective",
              text: "Set educational goals and objectives",
              completed: false,
            },
            {
              id: "target",
              text: "Set specific targets and timelines",
              completed: false,
            },
          ],
        },
        {
          name: "Data Collection and Baseline Assessment",
          progress: 0,
          actions: [
            {
              id: "baseline",
              text: "Platform collects baseline data on beneficiaries",
              completed: false,
            },
            {
              id: "4",
              text: "Platform assessments current academic standing",
              completed: false,
            },
            {
              id: "5",
              text: "Platform identifies challenges and opportunities for improvement",
              completed: false,
            },
          ],
        },
        {
          name: "Monitoring and Support",
          progress: 0,
          actions: [
            {
              id: "6",
              text: "Platform regularly monitors beneficiaries' academic performance",
              completed: false,
            },
            {
              id: "7",
              text: "Platform provides academic support as needed (e.g. tutoring)",
              completed: false,
            },
            {
              id: "8",
              text: "Platform addresses challenges and barriers promptly",
              completed: false,
            },
          ],
        },
        {
          name: "Periodic Surveys and Feedback",
          progress: 0,
          actions: [
            {
              id: "9",
              text: "Platform conducts surveys to gather feedback from beneficiaries",
              completed: false,
            },
            {
              id: "10",
              text: "Platform uses feedback for program improvement",
              completed: false,
            },
            {
              id: "11",
              text: "Platform ensures beneficiaries' voices are heard",
              completed: false,
            },
          ],
        },
        {
          name: "Outcome Measurement",
          progress: 0,
          actions: [
            {
              id: "12",
              text: "Platform measures program outcomes (e.g., improved GPA)",
              completed: false,
            },
            {
              id: "13",
              text: "Platform analyzes results to assess program effectiveness",
              completed: false,
            },
            {
              id: "14",
              text: "Platform adjusts strategies based on outcomes",
              completed: false,
            },
          ],
        },
        {
          name: "Reporting and Communication",
          progress: 0,
          actions: [
            {
              id: "15",
              text: "Platform generates reports on beneficiary progress and program impact",
              completed: false,
            },
            {
              id: "16",
              text: "Platform shares reports with stakeholders (e.g., donors, educators)",
              completed: false,
            },
            {
              id: "17",
              text: "Platform communicates successes and areas for improvement",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      type: "entrepreneurship",
      stages: [
        {
          name: "Goal Setting",
          progress: 0,
          actions: [
            {
              id: "objective",
              text: "Set entrepreneurial goals and strategies",
              completed: false,
            },
            {
              id: "target",
              text: "Set specific targets and timelines",
              completed: false,
            },
          ],
        },
        {
          name: "Resource Allocation",
          progress: 0,
          actions: [
            {
              id: "3",
              text: "Platform allocates resources (e.g., funding, mentorship)",
              completed: false,
            },
            {
              id: "4",
              text: "Platform ensures entrepreneurs have access to necessary tools",
              completed: false,
            },
            {
              id: "5",
              text: "Platform monitors resource utilization",
              completed: false,
            },
          ],
        },
      ],
    },
  ];

  if (!programData) return <Skeleton active />;

  return (
    <>
      <div className="container mx-auto p-4">
        <div className={"my-5"}>
          <div className={"flex border rounded-lg"}>
            <div className={"w-6/12 flex items-center border-e p-8"}>
              <div className={"text-center mx-auto"}>
                <div className={"flex justify-center"}>
                  <Space wrap>
                    <Progress
                      type="circle"
                      percent={mainProgress}
                      strokeColor="green"
                    />
                  </Space>
                </div>
                <h6 className={"text-2xl pb-4 pt-5"}>Progress of Program</h6>
              </div>
            </div>
            <div className={"w-full"}>
              {selectedCategoryData ? (
                <div>
                  <Collapse
                    bordered={false}
                    defaultActiveKey={["1"]}
                    accordion
                    expandIconPosition="right"
                  >
                    {selectedCategoryData.stages.map((stage, index) => (
                      <Panel
                        header={
                          <div className={"flex items-center text-[18px]"}>
                            <Progress
                              type="circle"
                              strokeColor="green"
                              percent={stage.progress}
                              width={35}
                              className={"mr-3"}
                              showInfo={false}
                            />
                            <span>{stage.name}</span>
                          </div>
                        }
                        key={stage.name}
                        disabled={
                          index > 0 &&
                          selectedCategoryData.stages
                            .slice(0, index)
                            .some((prevStage) => prevStage.progress < 100)
                        }
                      >
                        <ul className={"text-[#808080] text-[16px]"}>
                          {stage.actions.map((action, actionIndex) => (
                            <li
                              key={action.text}
                              className={"flex items-center border-t"}
                            >
                              <span
                                className={"inline my-3 cursor-pointer"}
                                onClick={() => {
                                  handleStageClick(index, actionIndex, action);
                                }}
                              >
                                <Progress
                                  type="circle"
                                  percent={action.completed && 100}
                                  width={30}
                                  strokeWidth={0}
                                  className={`mr-3 ${
                                    action.completed
                                      ? "bg-[#e5f2e5]"
                                      : "bg-[#ff4d4f2b]"
                                  } rounded-full`}
                                  status={!action.completed && "exception"}
                                />
                                <span>{action.text}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              ) : (
                <div className={"p-5 m-5"}>
                  <strong>No Data Found</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Button
            type={"primary"}
            className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
            onClick={() =>
              navigate(`/dashboard/suitedetails?id=${programData._id}`)
            }
          >
            Finish
          </Button>
        </div>
      </div>
    </>
  );
};

export default SuiteTrack;
