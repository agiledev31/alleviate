import {Allotment} from "allotment";
import "allotment/dist/style.css";
import {Button, Popconfirm, Skeleton, Space} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import MultiStepComponent from "../../components/MultiStepComponent";
import MultiStepConfigurator from "../../components/MultiStepConfigurator";
import CrudService from "../../service/CrudService";
import getMetricsPrompt from "./getMetricsPrompt";

const TemplateEdit = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [funnelSteps, setFunnelSteps] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [isClickPublish, setClickPublish] = useState(false);
  const [formType, setFormType] = useState();
  const [activeStep, setActiveStep] = useState(0);
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
    setFormType(formType)
    if (!id) return;
    setProgramData(null);
    setFunnelSteps([]);
    setThinking(false);

    CrudService.getSingle("DefaultAssessment", id).then((res) => {
      if (!res.data) return;
      setProgramData(res.data);

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

          const metrics = (res.data.KpiDetails && res.data.KpiDetails.length > 0) ? res.data.KpiDetails.map(item => item.MetricName) : []
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
          await CrudService.update("DefaultAssessment", id, { form: formData });
          CrudService.getSingle("DefaultAssessment", id).then((res) => {
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
  ];

  return (
    <>
      <div style={{ height: "80vh" }}>
        {formType === 'templatePre' && (
            <MultiStepComponent
                displaySteps={true}
                AIEnhancements={true}
                steps={steps}
                formType={'templatePre'}
                isClickedPublish={isClickPublish}
                activeStep={activeStep}
                onPublish={async (formData) => {
                  const id = searchParams.get("id");
                  if (!id) return;
                  if (formData.isPublished) {
                    setTimeout(() => {
                      if (formType === "templatePre") {
                        navigate(`/dashboard/templatedetails?id=${id}`);
                      } else {
                        navigate(`/dashboard/programpublish?id=${id}`);
                      }
                    }, 300)
                  }
                }}
            />
        )}

        <Allotment defaultSizes={[150, 150]}>
          <Allotment.Pane snap>
            <MultiStepComponent steps={funnelSteps} />
          </Allotment.Pane>
          <Allotment.Pane snap>
            <div>
              <MultiStepConfigurator
                funnelSteps={funnelSteps}
                setFunnelSteps={(e) => {
                  const result = typeof e === "function" ? e(funnelSteps) : e;

                  setFunnelSteps(result);

                  const id = searchParams.get("id");
                  if (!id) return;
                  CrudService.update("DefaultAssessment", id, { form: result });
                }}
              />
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>

      <Space>
        <Popconfirm
          title="Are you sure to delete this assessment?"
          onConfirm={async () => {
            const id = searchParams.get("id");
            if (!id) return;
            await CrudService.delete("DefaultAssessment", id);
            navigate("/dashboard/template");
          }}
        >
          <Button danger>Delete Assessment</Button>
        </Popconfirm>
        <Button
          type="primary"
          onClick={() => {
            const id = searchParams.get("id");
            if (!id) return;
            if (formType === 'templatePre') {
              setClickPublish(true);
              setActiveStep(2);
            }
            navigate(`/dashboard/templatedetails?id=${programData.template}`);
          }}
        >
          Finish
        </Button>
      </Space>
    </>
  );
};

export default TemplateEdit;
