import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { Button, Popconfirm, Skeleton, Space, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import MultiStepConfigurator from "../../components/MultiStepConfigurator";
import CrudService from "../../service/CrudService";
import getFormPrompt from "./getFormPrompt";
import getMetricsPrompt from "./getMetricsPrompt";

const ProgramEdit = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [funnelSteps, setFunnelSteps] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [isClickPublish, setClickPublish] = useState(false);
  const [formType, setFormType] = useState();
  const [activeStep, setActiveStep] = useState(0);
  const [kpiDetails, setKpiDetails] = useState([]);
  const vidRef = useRef();
  const socket = useRef();

  useEffect(() => {
    if (programData?.form) setFunnelSteps(programData.form);
  }, [programData]);

  useEffect(() => {
    if (vidRef.current) vidRef.current.play();
  }, [vidRef]);

  useEffect(() => {
    const id = searchParams.get("id");
    const formType = searchParams.get("formType");
    setFormType(formType);
    if (!id) return;
    setProgramData(null);
    setFunnelSteps([]);
    setThinking(false);

    CrudService.getSingle("Program", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);

      if (res.data.KpiDetails && res.data.KpiDetails.length > 0) {
        const kpis = res.data.KpiDetails.map((item) => ({
          value: item._id,
          label: item.MetricName,
        }));
        setKpiDetails(kpis);
      }

      if (!res.data?.form) {
        setThinking(true);
        socket.current = new WebSocket(
          `wss://booklified-chat-socket.herokuapp.com`
        );

        socket.current.addEventListener("open", async () => {
          setInterval(
            () => socket.current.send(JSON.stringify({ id: "PING" })),
            30000
          );
          // const content = getFormPrompt(`
          // We need a multistep form for an assessment that will be used by an NGO organization. The assessment is for a program:
          // Program name: ${res.data.name}
          // Program description: ${res.data.description}
          //
          // Please create a form that asks as much qualifying questions as possible!
          // `);

          const metrics =
            res.data.KpiDetails && res.data.KpiDetails.length > 0
              ? res.data.KpiDetails.map((item) => item.MetricName)
              : [];
          const content = getMetricsPrompt(metrics, res.data);

          socket.current.send(
            JSON.stringify({
              id: "OPEN_AI_PROMPT",
              payload: {
                content,
                model: "gpt-3.5-turbo-16k",
              },
            })
          );
        });

        socket.current.addEventListener("message", async (event) => {
          const message = JSON.parse(event.data);
          let formData = [];
          const response = message.payload?.response;
          try {
            formData = JSON.parse(
              `[${response
                .split("[")
                ?.slice(1)
                .join("[")
                .split("]")
                .slice(0, -1)
                .join("]")}]`
            );
            if (!Array.isArray(formData)) throw new Error("Not an array");
          } catch (e) {}
          await CrudService.update("Program", id, { form: formData });
          CrudService.getSingle("Program", id).then((res) => {
            setProgramData(res.data);
            setThinking(false);
          });
        });
      }
    });
  }, [searchParams]);

  if (!programData) return <Skeleton active />;
  if (thinking)
    return (
      <div className="flex justify-center">
        <video
          className="rounded-xl"
          ref={vidRef}
          muted
          src="/videos/aithink.mp4"
          autoPlay
          loop
          style={{ height: "80vh" }}
        />
      </div>
    );

  if (!funnelSteps) return <Skeleton active />;

  const steps = [
    {
      id: "step1",
      name: "General Information",
      form: [],
    },
    {
      id: "step2",
      name: "Edit Form",
      form: [],
    },
    {
      id: "step3",
      name: "Publish",
      form: [],
    },
  ];

  return (
    <>
      <div style={{ height: "80vh" }}>
        {formType === "programPre" && (
          <MultiStepComponent
            displaySteps={true}
            AIEnhancements={true}
            steps={steps}
            formType={"programPre"}
            isClickedPublish={isClickPublish}
            activeStep={activeStep}
            onPublish={async (formData) => {
              const id = searchParams.get("id");
              if (!id) return;
              if (formData.isPublished) {
                setTimeout(() => {
                  navigate(`/dashboard/programpublish?id=${id}`);
                }, 300);
              }
            }}
          />
        )}

        <Allotment>
          <Allotment.Pane snap>
            <>
              <MultiStepComponent
                steps={funnelSteps}
                isProgramEditForm={true}
                kpis={kpiDetails}
                onProgramFormEdit={(result) => {
                  setFunnelSteps(result);
                  const id = searchParams.get("id");
                  if (!id) return;
                  CrudService.update("Program", id, { form: result });
                }}
              />
            </>
          </Allotment.Pane>
        </Allotment>
      </div>

      <div className="w-full flex justify-end">
        <Tooltip
          title={
            programData && !programData.suite.published
              ? "Please publish the program first, and then proceed to publish this assessment."
              : ""
          }
        >
          <Button
            type="primary"
            className="bg-gradient-to-r from-indigo-100 to-indigo-500 hover:from-indigo-300 hover:to-indigo-700 text-white font-bold py-1 px-4 rounded !text-white hover:!text-white"
            onClick={() => {
              if (programData && !programData.suite.published) return;
              const id = searchParams.get("id");
              if (!id) return;
              if (formType === "programPre") {
                setClickPublish(true);
                setActiveStep(2);
              } else {
                navigate(`/dashboard/programpublish?id=${id}`);
              }
            }}
          >
            Publish Assessment
          </Button>
        </Tooltip>
      </div>
    </>
  );
};

export default ProgramEdit;
