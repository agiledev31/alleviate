import "allotment/dist/style.css";
import {
  Skeleton,
  Table,
  Progress,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader";
import StrapiService from "../../service/StrapiService";
import { sdgDefault } from "../../data/constants";

const SDGDetails = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programMetricsData, setProgramMetricsData] = useState(null)
  const [currentSDG, setCurrentSDG] = useState(null)


  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const _currentSDG = sdgDefault.filter(i => i.index == id)[0];
    if(_currentSDG) setCurrentSDG(_currentSDG);
    StrapiService.getCoreProgramMetrics({sdgId: id}).then(({ data }) => {
        setProgramMetricsData(data)
        console.log("res", data);
      });
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const CPMColumns = [
    {
        title: 'Metric Name',
        dataIndex: 'MetricName',
        key: 'MetricName',
        width: 700,
    },
    {
        title: 'Impact Focus',
        dataIndex: 'impact_category',
        key: 'impact_category',
        width: 200,
        render: (impact_category) => impact_category?.[0].Name || '',
    },
    {
        title: 'Target',
        dataIndex: 'Target',
        key: 'Target',
        width: 150,
        render: (text) => text || '',
    },
    {
        title: 'Progress',
        dataIndex: 'Progress',
        key: 'Progress',
        width: 400,
        render: (sdgs) => (<Progress percent={0} />),
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 300,
        render: (metric) => (null),
    },
  ];

  if (!programMetricsData) return <Skeleton active />;
  
  return (
    <>
      <div style={{ height: "80vh" }}>
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-3">{ currentSDG.label }</h1>
          <div 
            className="flex flex-row justify-start items-center w-full p-1 text-white"
            style={{backgroundColor: `${currentSDG.color}`}}
          >
                <img
                    className="h-[130px] w-auto rounded-md"
                    src={`/images/sdg-icons/E_WEB_${currentSDG.index}.png`}
                    alt={currentSDG.label}
                />
                <div className="flex flex-col justify-start">
                    <div className="pl-2">{ currentSDG.label }</div>
                    <div className="p-2">In 2015, all United Nations Member States adopted the 2030 Agenda for Sustainable Development and its corresponding 17 Sustainable Development Goals (SDGs).</div>
                </div>
          </div>
          <Table
                dataSource={programMetricsData}
                columns={CPMColumns}
                rowKey={(record) => record.ID}
                pagination={false}
                scroll={{ x: '700px'}}
            />
               
      </div>
    </>
  );
};

export default SDGDetails;
