import React from "react";
import "./spinner.css";
import {Spin} from "antd";
import { FaSpinner } from "react-icons/fa6";


export default function LoadingSpinner() {
    return (
        <Spin className="spinner-container"
            indicator={
                <FaSpinner
                    icon="spinner"
                    className="loading-spinner"
                    style={{
                        fontSize: 30,
                    }}
                    spin
                />
            }
        />
    );
}
