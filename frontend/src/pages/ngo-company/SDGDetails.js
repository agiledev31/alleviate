import "allotment/dist/style.css";
import {
  Skeleton,
  Table,
  Button,
  Progress,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/Loader";
import { AiOutlineArrowRight } from "react-icons/ai";
import StrapiService from "../../service/StrapiService";
import DashboardService from "../../service/DashboardService";
import { sdgDefault } from "../../data/constants";

const SDGDetails = () => {
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [programMetricsData, setProgramMetricsData] = useState([]);
  const [mySuites, setMySuites] = useState([]);
  const [myFilteredSuites, setMyFilteredSuites] = useState([]);
  const [selectedImpactTheme, setSelectedImpactTheme] = useState(null)
  const [currentSDG, setCurrentSDG] = useState(null);
  const [impactThemeList, setImpactThemeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const _currentSDG = sdgDefault.filter(i => i.index == id)[0];
    if (_currentSDG) setCurrentSDG(_currentSDG);
    StrapiService.getCoreProgramMetrics({ sdgId: id, }).then((res) => {
      setProgramMetricsData(res.data);
      const _programMetricsData = res.data;
      DashboardService.getMySuites().then(({ data }) => {
        let _programMetricsDataIds = _programMetricsData.map(item => item._id);
        let _temp = data.filter(item => {
          let _kpis = item.KPIs;
          let i = _kpis.length - 1;
          while (i >= 0) {
            if (_programMetricsDataIds.includes(_kpis[i])) {
              return true;
            }
            i--;
          }
          return false;
        })
        setMySuites(_temp);
        setLoading(false)
      });
    });
    
    StrapiService.getList("themes").then(({ data }) => {
      setImpactThemeList(data);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedImpactTheme) return;
    let _temp = mySuites.filter(item => {
      if(item.impactThemes.includes(selectedImpactTheme)) return true;
      return false;
    })
    setMyFilteredSuites(_temp);
  }, [selectedImpactTheme])

  useEffect(() => {
    load();
  }, [load]);

  const MySuiteColumns = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
      width: 700,
      render: (name) => (
        <div className="!outline-none text-[#056885] font-bold text-[22px]">
          {name}
        </div>
      )
    },
    {
        title: 'Impact Themes',
        dataIndex: 'impactThemes',
        key: 'impactThemes',
        width: 350,
        render: (impactThemes) => {
          return (
            <div>
              {impactThemes.map((item, index)=> (
                <div 
                  className="m-1 flex flex-row justify-end items-center cursor-pointer hover:opacity-70"
                  onClick={() =>setSelectedImpactTheme(item)}
                >
                  <span className="text-indigo-500 font-bold px-3 font-[16px]">
                    {impactThemeList.filter(theme => theme._id == item)?.[0]?.Name}
                  </span>
                  <AiOutlineArrowRight
                    size={15}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )
        }
    },
  ];

  const SuitesWithIpactThemeColumns = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
      width: 700,
    },
  ];

  return (
    <>
      <div style={{ height: "80vh" }} className="px-10">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-3">{currentSDG?.label}</h1>
        <div
          className="flex flex-row justify-start items-center w-full p-1 text-white"
          style={{ backgroundColor: `${currentSDG?.color}` }}
        >
          <img
            className="h-[130px] w-auto rounded-md"
            src={`/images/sdg-icons/E_WEB_${currentSDG?.index}.png`}
            alt={currentSDG?.label}
          />
          <div className="flex flex-col justify-start">
            <div className="pl-2">{currentSDG?.label}</div>
            <div className="p-2">In 2015, all United Nations Member States adopted the 2030 Agenda for Sustainable Development and its corresponding 17 Sustainable Development Goals (SDGs).</div>
          </div>
        </div>
        {loading 
          ? <LoadingSpinner />
          : <div className="py-10">
              { !selectedImpactTheme
              ? <div>
                  <Table
                    dataSource={mySuites}
                    columns={MySuiteColumns}
                    rowKey={(record) => record.ID}
                    pagination={false}
                    scroll={{ x: '700px' }}
                  />
                </div>
              : <div>
                  <div className="flex flex-row justify-between items-center">
                    <div className="text-xl font-bold text-indigo-900 mb-3">
                      {impactThemeList.filter(theme => theme._id == selectedImpactTheme)?.[0]?.Name}
                    </div>
                    <Button
                      type="primary"
                      onClick={() => setSelectedImpactTheme(null)}
                      className="m-3 border rounded"
                    >
                      Back
                    </Button>
                  </div>
                  
                  <Table
                    dataSource={myFilteredSuites}
                    columns={SuitesWithIpactThemeColumns}
                    rowKey={(record) => record.ID}
                    pagination={false}
                    scroll={{ x: '700px' }}
                  />
                </div>
              }
            </div>
        }
      </div>
    </>
  );
};

export default SDGDetails;
