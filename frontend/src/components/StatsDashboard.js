import { Card, Col, Row, Spin, Statistic } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdRefresh } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import StatsService from "../service/StatsService";
import { Pie } from "@ant-design/charts";

const StatsDashboard = ({ type = '' }) => {
  let [searchParams] = useSearchParams();
  const [KPIs, setKPIs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartKPIs, setChartKPIs] = useState([]);
  const [loading4, setLoading4] = useState(false);

  const isLoading = useMemo(() => loading4, [loading4]);

  const loadData = useCallback(() => {
    const id = searchParams.get("id");
    if (!id) return;

    setLoading4(true);

    if (type === "assessment") {
      StatsService.getAssessmentSurveys(id ?? "")
        .then(({ data }) => {
          setKPIs(data.KPIs || []);
          setChartKPIs(data.chartKPIs || []);
        })
        .finally(() => {
          setLoading4(false);
        });
    } else {
      StatsService.getSurveys(id ?? "")
        .then(({ data }) => {
          setKPIs(data.KPIs || []);
          setChartKPIs(data.chartKPIs || []);
          const _totalCount = data.KPIs.reduce((sum, item) => sum + item.count, 0);
          const _chartData = data.KPIs.map(item => ({ label: item.key, ratio: parseFloat((item.count / _totalCount * 100).toFixed(2)) }));
          setChartData(_chartData);
        })
        .finally(() => {
          setLoading4(false);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateChartData = (data) => {
    return {
      appendPadding: 50,
      data: data,
      angleField: "ratio",
      colorField: "label",
      radius: 1,
      autoFit: true,
      label: {
        type: 'inner',
        offset: '-30%',
        content: function content(_ref) {
          return ''.concat(_ref.ratio, '%');
        },
        style: {
          fontSize: 12,
          textAlign: 'center',
        }
      },
      legend: {
        position: "top",
        flipPage: false,
        style: {
          textAlign: "center"
        }
      },
      interactions: [{ type: "pie-legend-active" }, { type: "element-active" }]
    };
  };

  return (
    <>
      <div>
        {(KPIs?.length > 0 || chartKPIs?.length > 0) && (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <div className="mb-2 flex justify-between">
                  <h2 className="font-semibold">KPIs</h2>
                  {isLoading ? (
                    <Spin />
                  ) : (
                    <MdRefresh
                      size={20}
                      onClick={loadData}
                      className="cursor-pointer"
                    />
                  )}
                </div>

                <Row gutter={[16, 16]} className="mt-2">
                  <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                    <Pie {...generateChartData(chartData)} />
                  </div>
                </Row>

                <Row gutter={[16, 16]} className="mt-2">
                  {KPIs.map((kpi) => (
                    <Col span={8} key={kpi.key}>
                      <Card>
                        <div style={{ textAlign: "center" }}>
                          <Statistic
                            title={kpi.key}
                            value={kpi.average.toFixed(2)}
                          />
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p>
                            Min: {kpi.min} | Max: {kpi.max}
                          </p>
                          <p>Median: {kpi.median}</p>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <Row gutter={[16, 16]} className="mt-2">
                  {chartKPIs?.length > 0 && (
                    chartKPIs.map((kpi) => (
                      <Col span={8} key={kpi.key}>
                        <Card className={'grid justify-center'}>
                          <div style={{ textAlign: "center", textTransform: 'capitalize' }}>
                            <h3>{kpi.key}</h3>
                          </div>
                          <div style={{ width: '360px', height: '360px', position: 'relative' }}>
                            <Pie {...generateChartData(kpi.value)} />
                          </div>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        {(KPIs?.length <= 0 && chartKPIs?.length <= 0) && (
          <span className="mt-2 font-bold">
            Metrics data not found
          </span>
        )}
      </div>
    </>
  );
};

export default StatsDashboard;
