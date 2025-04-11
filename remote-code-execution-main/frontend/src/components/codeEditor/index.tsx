import { useEffect, useState } from "react";

import styles from "@/styles/Home.module.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import { highlight, languages } from "prismjs/components/prism-core";
import { Button } from "antd";
import { Spin } from "antd";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";

interface IProps {
  problemId: string;
  baseCode: string;
}

const CodeEditor = (props: IProps) => {
  const { problemId, baseCode } = props;
  const [code, setCode] = useState(baseCode);

  const [output, setOutput] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobStatus, setJobStatus] = useState("");

  useEffect(() => {
    setCode(baseCode);
    setOutput("");
    setJobId("");
    setJobStatus("");
  }, [baseCode]);

  const runCodeClickHandler = async () => {
    try {
      const response = await axios.post("http://localhost:8000/code", {
        code,
        problemId,
      });

      if (response.data?.data?.jobId) {
        setJobId(response.data.data.jobId);
        setJobStatus("PROCESSING");
      } else {
        console.error("Unexpected response format:", response);
        setJobStatus("ERROR");
      }
    } catch (err) {
      console.error("Error posting code:", err);
      setJobStatus("ERROR");
    }
  };

  useEffect(() => {
    if (jobId) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:8000/job/${jobId}`);
          if (res.data?.data) {
            const { jobStatus, jobOutput } = res.data.data;
            setJobStatus(jobStatus);
            setOutput(jobOutput);

            if (jobStatus !== "PROCESSING") {
              clearInterval(interval);
            }
          } else {
            console.error("Unexpected job response:", res);
            setJobStatus("ERROR");
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error fetching job status:", err);
          setJobStatus("ERROR");
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval); // clean up
    }
  }, [jobId]);

  const getMessageToDisplay = () => {
    if (jobStatus === "SUCCESS") {
      return (
        <span className={styles.success}>
          Congratulations!!! Your code is running on all test cases
        </span>
      );
    } else if (jobStatus === "MISMATCHED") {
      return (
        <span className={styles.error}>
          Test cases are failing! Please check your code
        </span>
      );
    } else if (jobStatus === "PROCESSING") {
      return <span>Code Is Running</span>;
    } else if (jobStatus === "ERROR") {
      return (
        <span className={styles.error}>Error while compiling the code!!!</span>
      );
    }
  };

  return (
    <div className={styles.code}>
      <Editor
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          width: "100%",
          height: "70%",
          border: "1px solid gray",
          borderRadius: "5px",
          backgroundColor: "black",
          color: "white",
        }}
      />
      <Button
        type="primary"
        className={styles.btn}
        onClick={runCodeClickHandler}
      >
        Submit Code
      </Button>
      {jobStatus && (
        <div className={styles.output}>
          <p>Output</p>
          {jobStatus === "PROCESSING" ? (
            <div className={styles.spinnerContainer}>
              <Spin />
            </div>
          ) : (
            <div>{getMessageToDisplay()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
